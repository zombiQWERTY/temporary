package server

import (
	"bitbucket.org/ittinc/cases-service/cases_grpc"
	"bitbucket.org/ittinc/go-shared-packages/clients/postgres-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/projects-service/model"
	"bitbucket.org/ittinc/projects-service/policies"
	"bitbucket.org/ittinc/projects-service/projects"
	httpTransport "bitbucket.org/ittinc/projects-service/projects/transport/http"
	"bitbucket.org/ittinc/users-service/users_grpc"
	"errors"
	"github.com/asaskevich/govalidator"
	"github.com/go-chi/chi"
	chiMiddleware "github.com/go-chi/chi/middleware"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"syscall"

	projectsImpl "bitbucket.org/ittinc/projects-service/projects/implementation"
	projectsRepository "bitbucket.org/ittinc/projects-service/projects/repository"
	"context"
	"flag"
	"fmt"
	"github.com/jinzhu/gorm"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"time"
)

type App struct {
	httpHost     string
	httpServer   *http.Server
	Logger       *logrus.Entry
	projectsImpl projects.Implementation
	stopFns      []func()
}

func initConsul(consulAddress, consulPort, initiator string, logger *logrus.Entry) service_discovery.ServiceDiscovery {
	host := fmt.Sprintf("%s:%s", consulAddress, consulPort)
	healthCheck := func() (bool, error) { return true, nil }

	log := logger.WithFields(logrus.Fields{
		"initiator":       initiator,
		"registerService": true,
	})

	consulService, err := service_discovery.NewConsulDiscovery(initiator, host, healthCheck, true, log)

	if err != nil {
		log.Fatal("Failed to connect ConsulServiceDiscovery")
	}

	return consulService
}

func registerServices(serviceAddress, consulAddress, consulPort *string, httpPort int, log *logrus.Entry) ([]func(), service_discovery.ServiceDiscovery) {
	var stopFns []func()
	consulServiceHTTP := initConsul(*consulAddress, *consulPort, model.APP_SERVICE_NAME, log)
	stopFns = append(stopFns, consulServiceHTTP.Shutdown)

	err := consulServiceHTTP.RegisterService(model.APP_SERVICE_NAME, *serviceAddress, httpPort, model.APP_SERVICE_TTL, model.APP_DEREGESTER_CRITICAL_TTL)
	if err != nil {
		log.WithField("error", err).Fatal("Cant register service in ConsulServiceDiscovery")
	}

	return stopFns, consulServiceHTTP
}

func makePostgresClient(consulServiceHTTP service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) func(tenantID string, logger *logrus.Entry) (*gorm.DB, error) {
	callManager := postgres_client.NewCallManager(consulServiceHTTP, log, model.POSTGRES_SERVICE_NAME, model.POSTGRES_USER_KEY, model.POSTGRES_PASSWORD_KEY, model.POSTGRES_DATABASE_NAME_KEY)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start postgres call_manager")
	}

	return func(tenantID string, logger *logrus.Entry) (*gorm.DB, error) {
		if logger == nil {
			logger = log
		}

		tenantDomain := consulServiceHTTP.GetValueByKey(model.TENANTS_KEY + tenantID)
		if tenantDomain == nil {
			logger.WithField("tenantDomain", tenantDomain).Error("Not usual behaviour. TenantDomain by tenantID not found")
			return nil, errors.New("not usual behaviour, requested " + tenantID)
		}

		commands, err := callManager.GetApiConnection()
		if err != nil {
			logger.WithField("error", err).Error("Cant get postgres call_manager api connection")
			return nil, err
		}

		db, err := commands.API(tenantID)
		if err != nil {
			logger.WithField("error", err).Error("Failed to connect postgres database by tenantID")
			return nil, err
		}

		if db == nil {
			logger.Error("Database not found")
			return nil, shared_errors.ErrDatabaseDown
		}

		return db, nil
	}
}

func init() {
	policies.InitPolicies()
	govalidator.SetFieldsRequiredByDefault(true)
}

func NewApp(log *logrus.Entry) *App {
	serviceAddress := flag.String("svc_address", "", "service address")
	serviceHTTPPort := flag.String("svc_port", "", "service port")

	consulAddress := flag.String("consul_address", "", "consul address")
	consulPort := flag.String("consul_port", "", "consul port")
	flag.Parse()

	log = log.WithFields(logrus.Fields{
		"appServiceName":     model.APP_SERVICE_NAME,
		"appServiceAddress":  *serviceAddress,
		"appServiceHTTPPort": *serviceHTTPPort,
		"appConsulAddress":   *consulAddress,
		"appConsulPort":      *consulPort,
	})

	if len(*serviceAddress) == 0 || len(*serviceHTTPPort) == 0 || len(*consulAddress) == 0 || len(*consulPort) == 0 {
		log.Fatal("Invalid config flags provided")
	}

	httpPort, _ := strconv.Atoi(*serviceHTTPPort)
	httpHost := fmt.Sprintf(":%d", httpPort)

	stopFns, consulServiceHTTP := registerServices(serviceAddress, consulAddress, consulPort, httpPort, log)
	postgresClient := makePostgresClient(consulServiceHTTP, stopFns, log)
	usersClient, stopFns := users_grpc.MakeUsersGRPCClient(consulServiceHTTP, stopFns, log)
	casesClient, stopFns := cases_grpc.MakeCasesGRPCClient(consulServiceHTTP, stopFns, log)

	projectsRepo := projectsRepository.NewProjectsRepository(postgresClient, log)

	return &App{
		httpHost:     httpHost,
		stopFns:      stopFns,
		Logger:       log,
		projectsImpl: projectsImpl.NewProjectsImpl(projectsRepo, consulServiceHTTP, log, usersClient, casesClient),
	}
}

func (a *App) Run() error {
	router := chi.NewRouter()
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.RealIP)
	router.Use(chiMiddleware.Logger)
	router.Use(chiMiddleware.Recoverer)
	router.Use(shared_middleware.TenantMiddleware)

	var httpOptions []kithttp.ServerOption
	h := httpTransport.RegisterHTTPEndpoints(router, httpOptions, a.projectsImpl, a.Logger)

	a.httpServer = &http.Server{
		Addr:           a.httpHost,
		Handler:        h,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	errs := make(chan error)
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		errs <- fmt.Errorf("%s", <-quit)
	}()

	a.Logger.Info("Service started")
	go func() {
		errs <- a.httpServer.ListenAndServe()
	}()

	e := <-errs
	ctx, shutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdown()

	for _, fn := range a.stopFns {
		fn()
	}

	a.Logger.WithField("error", e).Error("Service stopped")
	return a.httpServer.Shutdown(ctx)
}
