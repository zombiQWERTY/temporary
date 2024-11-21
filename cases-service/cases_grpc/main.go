package cases_grpc

import (
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeCasesGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.CasesServiceClient, error), []func()) {
	const SERVICE_NAME = "cases_service_grpc"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewCasesServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start signal call_manager with grpc_client")
	}

	return func() (pb.CasesServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get signal call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.CasesServiceClient), nil
	}, stopFns
}
