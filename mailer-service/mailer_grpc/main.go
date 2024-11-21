package mailer_grpc

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/grpc-client"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func MakeMailerGRPCClient(consulServiceGRPC service_discovery.ServiceDiscovery, stopFns []func(), log *logrus.Entry) (func() (pb.MailerServiceClient, error), []func()) {
	const SERVICE_NAME = "mailer_service"

	makeGRPCClient := func(cc *grpc.ClientConn) interface{} {
		return pb.NewMailerServiceClient(cc)
	}

	callManager := grpc_client.NewCallManager(consulServiceGRPC, log, makeGRPCClient, SERVICE_NAME)
	err := callManager.Start()
	stopFns = append(stopFns, callManager.Stop)

	if err != nil {
		log.WithField("error", err).Fatal("Cant start mailer call_manager with grpc_client")
	}

	return func() (pb.MailerServiceClient, error) {
		commands, err := callManager.GetApiConnection()
		if err != nil {
			log.WithField("error", err).Error("Cant get mailer call_manager api connection")
			return nil, err
		}

		return commands.API().(pb.MailerServiceClient), nil
	}, stopFns
}
