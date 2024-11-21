package tenants_grpc

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeTenantsGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.TenantsServiceClient, error), []func()) {
	const SERVICE_NAME = "tenants_service"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewTenantsServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start tenants call_manager with grpc_client")
	}

	return func() (pb.TenantsServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get tenants call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.TenantsServiceClient), nil
	}, stopFns
}
