package grpc

import (
	"bitbucket.org/ittinc/mailer-service/mailer"
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	send kitgrpc.Handler
}

func (s *grpcServer) Send(ctx context.Context, r *pb.SendRequest) (*pb.SendResponse, error) {
	_, resp, err := s.send.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.SendResponse), nil
}

func NewGRPCServer(usersImpl mailer.Implementation) pb.MailerServiceServer {
	endpoints := MakeEndpoints(usersImpl)

	return &grpcServer{
		send: kitgrpc.NewServer(
			endpoints.Send,
			decodeSendRequest,
			encodeSendResponse,
		),
	}
}
