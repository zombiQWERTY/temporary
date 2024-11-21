package server

import (
	grpcTransport "bitbucket.org/ittinc/auth-service/auth/transport/grpc"
	httpTransport "bitbucket.org/ittinc/auth-service/auth/transport/http"
	"bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"bitbucket.org/ittinc/auth-service/model"
	"bitbucket.org/ittinc/go-shared-packages/clients/redis-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/users-service/users_grpc"
	"github.com/go-chi/chi"
	chiMiddleware "github.com/go-chi/chi/middleware"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/go-redis/redis/v7"
	"github.com/grpc-ecosystem/go-grpc-middleware"
	"github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net"
	"syscall"

	"bitbucket.org/ittinc/auth-service/auth"
	authImpl "bitbucket.org/ittinc/auth-service/auth/implementation"
	"context"
	"flag"
	"fmt"
	"google.golang.org/grpc"
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
	authImpl   auth.Implementation
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
	stopFns = append(stopFns, consulServiceHTTP.Shutdown, consulServiceGRPC.Shutdown)

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

func makeRedisClient(consulServiceHTTP service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) func() (*redis.Client, error) {
	callManager := redis_client.NewCallManager(consulServiceHTTP, log, model.REDIS_SERVICE_NAME, model.REDIS_DB_KEY, model.REDIS_PASSWORD_KEY)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start redis call_manager")
	}

	return func() (*redis.Client, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get redis call_manager api connection")
			return nil, err
		}

		return commands.API().(*redis.Client), nil
	}
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
	redisClient := makeRedisClient(consulServiceHTTP, stopFns, log)
	usersClient, stopFns := users_grpc.MakeUsersGRPCClient(consulServiceHTTP, stopFns, log)

	return &App{
		httpHost: httpHost,
		grpcHost: grpcHost,
		stopFns:  stopFns,
		Logger:   log,
		authImpl: authImpl.NewAuthImpl(consulServiceHTTP, log, redisClient, usersClient),
	}
}

func (a *App) Run() error {
	router := chi.NewRouter()
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.RealIP)
	router.Use(chiMiddleware.Logger)
	router.Use(chiMiddleware.Recoverer)

	var httpOptions []kithttp.ServerOption
	h := httpTransport.RegisterHTTPEndpoints(router, httpOptions, a.authImpl, a.Logger)

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
		errs <- a.httpServer.ListenAndServe() // for http
	}()

	go func() {
		listener, err := net.Listen("tcp", a.grpcHost) // for grpc
		if err != nil {
			errs <- err
			return
		}

		pb.RegisterAuthServiceServer(a.grpcServer, grpcTransport.NewGRPCServer(a.authImpl))
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
