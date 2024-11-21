package signal_grpc

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/signal-service/signal_grpc/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeSignalGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.SignalServiceClient, error), []func()) {
	const SERVICE_NAME = "signal_service_grpc"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewSignalServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start signal call_manager with grpc_client")
	}

	return func() (pb.SignalServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get signal call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.SignalServiceClient), nil
	}, stopFns
}
