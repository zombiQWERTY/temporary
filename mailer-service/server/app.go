package server

import (
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/mailer-service/mailer"
	mailerImpl "bitbucket.org/ittinc/mailer-service/mailer/implementation"
	grpcTransport "bitbucket.org/ittinc/mailer-service/mailer/transport/grpc"
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"bitbucket.org/ittinc/mailer-service/model"
	"context"
	"flag"
	"fmt"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware"
	"github.com/grpc-ecosystem/go-grpc-middleware/recovery"
)

type App struct {
	host       string
	grpcServer *grpc.Server
	Logger     *logrus.Entry
	mailerImpl mailer.Implementation
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

func registerServices(serviceAddress, consulAddress, consulPort *string, httpPort int, log *logrus.Entry) ([]func(), service_discovery.ServiceDiscovery) {
	var stopFns []func()
	consulServiceGRPC := initConsul(*consulAddress, *consulPort, model.APP_SERVICE_NAME, log)
	stopFns = append(stopFns, consulServiceGRPC.Shutdown)

	err := consulServiceGRPC.RegisterService(model.APP_SERVICE_NAME, *serviceAddress, httpPort, model.APP_SERVICE_TTL, model.APP_DEREGESTER_CRITICAL_TTL)
	if err != nil {
		log.WithField("error", err).Fatal("Cant register service in ConsulServiceDiscovery")
	}

	return stopFns, consulServiceGRPC
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

	stopFns, consulServiceGRPC := registerServices(serviceAddress, consulAddress, consulPort, httpPort, log)

	return &App{
		host:       httpHost,
		stopFns:    stopFns,
		Logger:     log,
		mailerImpl: mailerImpl.NewMailerImpl(consulServiceGRPC.GetValueByKey, log),
	}
}

func (a *App) Run() {
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
		listener, err := net.Listen("tcp", a.host)
		if err != nil {
			errs <- err
			return
		}

		pb.RegisterMailerServiceServer(a.grpcServer, grpcTransport.NewGRPCServer(a.mailerImpl))
		errs <- a.grpcServer.Serve(listener)
	}()

	e := <-errs
	_, shutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdown()

	for _, fn := range a.stopFns {
		fn()
	}

	a.grpcServer.GracefulStop()
	a.Logger.WithField("error", e).Error("Service stopped")
}
