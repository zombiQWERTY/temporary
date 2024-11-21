package users_grpc

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/users-service/users_grpc/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeUsersGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.UsersServiceClient, error), []func()) {
	const SERVICE_NAME = "users_service_grpc"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewUsersServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start users call_manager with grpc_client")
	}

	return func() (pb.UsersServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get users call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.UsersServiceClient), nil
	}, stopFns
}
