package auth_grpc

import (
	"bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeAuthGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.AuthServiceClient, error), []func()) {
	const SERVICE_NAME = "auth_service_grpc"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewAuthServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start auth call_manager with grpc_client")
	}

	return func() (pb.AuthServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get auth call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.AuthServiceClient), nil
	}, stopFns
}