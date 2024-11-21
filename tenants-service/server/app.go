package server

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/postgres-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/tenants-service/model"
	"bitbucket.org/ittinc/tenants-service/tenants"
	tenantsImpl "bitbucket.org/ittinc/tenants-service/tenants/implementation"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/cases_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/directories_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/projects_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/users_service"
	tenantsRepository "bitbucket.org/ittinc/tenants-service/tenants/repository"
	grpcTransport "bitbucket.org/ittinc/tenants-service/tenants/transport/grpc"
	"bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"context"
	"errors"
	"flag"
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware"
	"github.com/grpc-ecosystem/go-grpc-middleware/recovery"
)

type App struct {
	httpHost    string
	grpcServer  *grpc.Server
	Logger      *logrus.Entry
	tenantsImpl tenants.Implementation
	stopFns     []func()
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

func makePostgresClient(consulServiceHTTP service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) func(logger *logrus.Entry) (*gorm.DB, error) {
	callManager := postgres_client.NewCallManager(consulServiceHTTP, log, model.POSTGRES_SERVICE_NAME, model.POSTGRES_USER_KEY, model.POSTGRES_PASSWORD_KEY, model.POSTGRES_DATABASE_NAME_KEY)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start postgres call_manager")
	}

	return func(logger *logrus.Entry) (*gorm.DB, error) {
		if logger == nil {
			logger = log
		}

		dbName := consulServiceHTTP.GetValueByKey(model.POSTGRES_DATABASE_NAME_KEY)
		if dbName == nil {
			logger.WithField("dbName", dbName).Error("Not usual behaviour. DB not found")
			return nil, errors.New("not usual behaviour")
		}

		commands, err := callManager.GetApiConnection()
		if err != nil {
			logger.WithField("error", err).Error("Cant get postgres call_manager api connection")
			return nil, err
		}

		db, err := commands.API(*dbName)
		if err != nil {
			logger.WithField("error", err).Error("Failed to connect postgres database")
			return nil, err
		}

		if db == nil {
			logger.Error("Database not found")
			return nil, shared_errors.ErrDatabaseDown
		}

		return db, nil
	}
}

func initServices(serviceDiscovery service_discovery.ServiceDiscovery, dev bool, logger *logrus.Entry) error {
	users := users_service.NewUsersService(serviceDiscovery)
	_, err := users.StartCM(logger)
	if err != nil {
		logger.Fatal("Cant prepare database", err)
		return err
	}

	projects := projects_service.NewProjectsService(serviceDiscovery)
	_, err = projects.StartCM(logger)
	if err != nil {
		logger.Fatal("Cant prepare database", err)
		return err
	}

	cases := cases_service.NewCasesService(serviceDiscovery)
	_, err = cases.StartCM(logger)
	if err != nil {
		logger.Fatal("Cant prepare database", err)
		return err
	}

	directories := directories_service.NewDirectoriesService(serviceDiscovery)
	_, err = directories.StartCM(logger)
	if err != nil {
		logger.Fatal("Cant prepare database", err)
		return err
	}

	tenantsList := serviceDiscovery.GetKeyList(model.TENANTS_KEY)
	for _, dbName := range tenantsList {
		dbName = strings.Replace(dbName, model.TENANTS_KEY, "", 1)
		if strings.Contains(dbName, "/") || len(dbName) == 0 {
			continue
		}

		usersLog := logger.WithFields(logrus.Fields{
			"ServiceName":  model.USERS_SERVICE_NAME,
			"DatabaseType": "postgres",
			"dbName":       dbName,
			"Dev":          dev,
		})

		projectsLog := logger.WithFields(logrus.Fields{
			"ServiceName":  model.PROJECTS_SERVICE_NAME,
			"DatabaseType": "postgres",
			"dbName":       dbName,
			"Dev":          dev,
		})

		casesLog := logger.WithFields(logrus.Fields{
			"ServiceName":  model.CASES_SERVICE_NAME,
			"DatabaseType": "postgres",
			"dbName":       dbName,
			"Dev":          dev,
		})

		directoriesLog := logger.WithFields(logrus.Fields{
			"ServiceName":  model.DIRECTORIES_SERVICE_NAME,
			"DatabaseType": "postgres",
			"dbName":       dbName,
			"Dev":          dev,
		})

		{
			{
				db, err := users.CreateDatabase(dbName)
				if err != nil {
					usersLog.Error("Cant connect database", err)
					return err
				}

				if db == nil {
					usersLog.Error("Cant find database", dbName)
					return err
				}

				usersLog.Info("Start migrating")

				err = users_service.Migrate(db.DB(), users_service.Service{
					ServiceName:  model.USERS_SERVICE_NAME,
					DatabaseType: "postgres",
					DBName:       dbName,
					Dev:          dev,
				})

				if err != nil && err.Error() != "no change" {
					usersLog.Error("Cant migrate database", err)
					return err
				}

				usersLog.Info("Database migrated")
			}

			{
				db, err := projects.CreateDatabase(dbName)
				if err != nil {
					projectsLog.Error("Cant connect database", err)
					return err
				}

				if db == nil {
					projectsLog.Error("Cant find database", dbName)
					return err
				}

				projectsLog.Info("Start migrating")

				err = projects_service.Migrate(db.DB(), projects_service.Service{
					ServiceName:  model.PROJECTS_SERVICE_NAME,
					DatabaseType: "postgres",
					DBName:       dbName,
					Dev:          dev,
				})

				if err != nil && err.Error() != "no change" {
					projectsLog.Error("Cant migrate database", err)
					return err
				}

				projectsLog.Info("Database migrated")
			}

			{
				db, err := cases.CreateDatabase(dbName)
				if err != nil {
					casesLog.Error("Cant connect database", err)
					return err
				}

				if db == nil {
					casesLog.Error("Cant find database", dbName)
					return err
				}

				casesLog.Info("Start migrating")

				err = cases_service.Migrate(db.DB(), cases_service.Service{
					ServiceName:  model.CASES_SERVICE_NAME,
					DatabaseType: "postgres",
					DBName:       dbName,
					Dev:          dev,
				})

				if err != nil && err.Error() != "no change" {
					casesLog.Error("Cant migrate database", err)
					return err
				}

				casesLog.Info("Database migrated")
			}

			{
				db, err := directories.CreateDatabase(dbName)
				if err != nil {
					directoriesLog.Error("Cant connect database", err)
					return err
				}

				if db == nil {
					directoriesLog.Error("Cant find database", dbName)
					return err
				}

				directoriesLog.Info("Start migrating")

				err = directories_service.Migrate(db.DB(), directories_service.Service{
					ServiceName:  model.DIRECTORIES_SERVICE_NAME,
					DatabaseType: "postgres",
					DBName:       dbName,
					Dev:          dev,
				})

				if err != nil && err.Error() != "no change" {
					directoriesLog.Error("Cant migrate database", err)
					return err
				}

				directoriesLog.Info("Database migrated")
			}
		}
	}

	return nil
}

func NewApp(log *logrus.Entry) *App {
	devMode := flag.Bool("dev", false, "dev mode flag")

	serviceAddress := flag.String("svc_address", "", "service address")
	serviceHTTPPort := flag.String("svc_port", "", "service port")

	consulAddress := flag.String("consul_address", "", "consul address")
	consulPort := flag.String("consul_port", "", "consul port")
	flag.Parse()

	log = log.WithFields(logrus.Fields{
		"devMode":            *devMode,
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

	tenantsRepo := tenantsRepository.NewTenantsRepository(postgresClient, log)
	go func() {
		_ = initServices(consulServiceHTTP, *devMode, log)
	}()

	return &App{
		httpHost:    httpHost,
		stopFns:     stopFns,
		Logger:      log,
		tenantsImpl: tenantsImpl.NewTenantsImpl(tenantsRepo, consulServiceHTTP, log, *devMode),
	}
}

func (a *App) Run() {
	grpcRecovery := func(p interface{}) (err error) {
		a.Logger.Error("panic triggered", p)
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
		listener, err := net.Listen("tcp", a.httpHost)
		if err != nil {
			errs <- err
			return
		}

		pb.RegisterTenantsServiceServer(a.grpcServer, grpcTransport.NewGRPCServer(a.tenantsImpl))
		errs <- a.grpcServer.Serve(listener)
	}()

	e := <-errs
	_, shutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdown()

	for _, fn := range a.stopFns {
		fn()
	}

	a.Logger.WithField("error", e).Error("Service stopped")
	a.grpcServer.Stop()
}
