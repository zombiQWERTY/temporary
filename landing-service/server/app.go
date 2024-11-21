package server

import (
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/landing-service/landing"
	httpTransport "bitbucket.org/ittinc/landing-service/landing/transport/http"
	"bitbucket.org/ittinc/landing-service/model"
	"bitbucket.org/ittinc/tenants-service/tenants_grpc"
	"bitbucket.org/ittinc/users-service/users_grpc"
	"github.com/asaskevich/govalidator"
	"github.com/go-chi/chi"
	chiMiddleware "github.com/go-chi/chi/middleware"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"strings"
	"syscall"

	landingImpl "bitbucket.org/ittinc/landing-service/landing/implementation"
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"time"
)

type App struct {
	httpHost   string
	httpServer *http.Server
	Logger     *logrus.Entry
	usersImpl  landing.Implementation
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

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
	govalidator.TagMap["nospace"] = func(str string) bool {
		return !strings.Contains(str, " ")
	}
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
	usersClient, stopFns := users_grpc.MakeUsersGRPCClient(consulServiceHTTP, stopFns, log)
	tenantsClient, stopFns := tenants_grpc.MakeTenantsGRPCClient(consulServiceHTTP, stopFns, log)

	err := consulServiceHTTP.RegisterService(model.APP_SERVICE_NAME, *serviceAddress, httpPort, model.APP_SERVICE_TTL, model.APP_DEREGESTER_CRITICAL_TTL)
	if err != nil {
		log.Fatal("Cant register service in ServiceDiscovery", err)
	}

	return &App{
		httpHost:  httpHost,
		stopFns:   stopFns,
		Logger:    log,
		usersImpl: landingImpl.NewUsersImpl(consulServiceHTTP, log, usersClient, tenantsClient),
	}
}

func (a *App) Run() error {
	router := chi.NewRouter()
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.RealIP)
	router.Use(chiMiddleware.Logger)
	router.Use(chiMiddleware.Recoverer)

	var httpOptions []kithttp.ServerOption
	h := httpTransport.RegisterHTTPEndpoints(router, httpOptions, a.usersImpl, a.Logger)

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
