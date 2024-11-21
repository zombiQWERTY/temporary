package server

import (
	"bitbucket.org/ittinc/cases-service/cases"
	grpcTransport "bitbucket.org/ittinc/cases-service/cases/transport/grpc"
	httpTransport "bitbucket.org/ittinc/cases-service/cases/transport/http"
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/cases-service/model"
	"bitbucket.org/ittinc/cases-service/policies"
	"bitbucket.org/ittinc/go-shared-packages/clients/postgres-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/users-service/users_grpc"
	"errors"
	"github.com/asaskevich/govalidator"
	"github.com/go-chi/chi"
	chiMiddleware "github.com/go-chi/chi/middleware"
	kithttp "github.com/go-kit/kit/transport/http"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net"
	"syscall"

	casesImpl "bitbucket.org/ittinc/cases-service/cases/implementation"
	casesRepository "bitbucket.org/ittinc/cases-service/cases/repository"
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
	httpHost   string
	grpcHost   string
	httpServer *http.Server
	grpcServer *grpc.Server
	Logger     *logrus.Entry
	casesImpl  cases.Implementation
	stopFns    []func()
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

func registerServices(serviceAddress, consulAddress, consulPort *string, httpPort, grpcPort int, log *logrus.Entry) ([]func(), service_discovery.ServiceDiscovery, service_discovery.ServiceDiscovery) {
	var stopFns []func()
	consulServiceHTTP := initConsul(*consulAddress, *consulPort, model.APP_SERVICE_NAME_HTTP, log)
	consulServiceGRPC := initConsul(*consulAddress, *consulPort, model.APP_SERVICE_NAME_GRPC, log)
	stopFns = append(stopFns, consulServiceHTTP.Shutdown)

	err := consulServiceHTTP.RegisterService(model.APP_SERVICE_NAME_HTTP, *serviceAddress, httpPort, model.APP_SERVICE_TTL, model.APP_DEREGESTER_CRITICAL_TTL)
	if err != nil {
		log.WithField("error", err).Fatal("Cant register service in ConsulServiceDiscovery")
	}

	err = consulServiceGRPC.RegisterService(model.APP_SERVICE_NAME_GRPC, *serviceAddress, grpcPort, model.APP_SERVICE_TTL, model.APP_DEREGESTER_CRITICAL_TTL)
	if err != nil {
		log.WithField("error", err).Fatal("Cant register service in ConsulServiceDiscovery")
	}

	return stopFns, consulServiceHTTP, consulServiceGRPC
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
	serviceHTTPPort := flag.String("svc_port_http", "", "http service port")
	serviceGRPCPort := flag.String("svc_port_grpc", "", "grpc service port")

	consulAddress := flag.String("consul_address", "", "consul address")
	consulPort := flag.String("consul_port", "", "consul port")
	flag.Parse()

	log = log.WithFields(logrus.Fields{
		"appServiceName":     model.APP_SERVICE_NAME,
		"appServiceAddress":  *serviceAddress,
		"appServiceHTTPPort": *serviceHTTPPort,
		"appServiceGRPCPort": *serviceGRPCPort,
		"appConsulAddress":   *consulAddress,
		"appConsulPort":      *consulPort,
	})

	if len(*serviceAddress) == 0 || len(*serviceHTTPPort) == 0 || len(*serviceGRPCPort) == 0 || len(*consulAddress) == 0 || len(*consulPort) == 0 {
		log.Fatal("Invalid config flags provided")
	}

	httpPort, _ := strconv.Atoi(*serviceHTTPPort)
	httpHost := fmt.Sprintf(":%d", httpPort)

	grpcPort, _ := strconv.Atoi(*serviceGRPCPort)
	grpcHost := fmt.Sprintf(":%d", grpcPort)

	stopFns, consulServiceHTTP, _ := registerServices(serviceAddress, consulAddress, consulPort, httpPort, grpcPort, log)
	postgresClient := makePostgresClient(consulServiceHTTP, stopFns, log)
	usersClient, stopFns := users_grpc.MakeUsersGRPCClient(consulServiceHTTP, stopFns, log)

	casesRepo := casesRepository.NewCasesRepository(postgresClient, log)

	return &App{
		httpHost:  httpHost,
		grpcHost:  grpcHost,
		stopFns:   stopFns,
		Logger:    log,
		casesImpl: casesImpl.NewCasesImpl(casesRepo, consulServiceHTTP, log, usersClient),
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
	h := httpTransport.RegisterHTTPEndpoints(router, httpOptions, a.casesImpl, a.Logger)

	a.httpServer = &http.Server{
		Addr:           a.httpHost,
		Handler:        h,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	grpcRecovery := func(p interface{}) (err error) {
		a.Logger.WithField("error", p).Error("grpc recovery: panic triggered")
		return status.Errorf(codes.Unknown, "panic triggered: %v", p)
	}

	opts := []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandler(grpcRecovery),
	}

	a.grpcServer = grpc.NewServer(
		grpc_middleware.WithUnaryServerChain(
			grpc_recovery.UnaryServerInterceptor(opts...),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_recovery.StreamServerInterceptor(opts...),
		),
	)

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

	go func() {
		listener, err := net.Listen("tcp", a.grpcHost) // for grpc
		if err != nil {
			errs <- err
			return
		}

		pb.RegisterCasesServiceServer(a.grpcServer, grpcTransport.NewGRPCServer(a.casesImpl))
		errs <- a.grpcServer.Serve(listener)
	}()

	e := <-errs
	ctx, shutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdown()

	for _, fn := range a.stopFns {
		fn()
	}

	a.Logger.WithField("error", e).Error("Service stopped")
	a.grpcServer.GracefulStop()
	return a.httpServer.Shutdown(ctx)
}
