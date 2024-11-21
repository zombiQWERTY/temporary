package grpc

import (
	"bitbucket.org/ittinc/signal-service/signal"
	"bitbucket.org/ittinc/signal-service/signal_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	fireEvent kitgrpc.Handler
}

func (s *grpcServer) FireEvent(ctx context.Context, r *pb.FireEventRequest) (*pb.FireEventResponse, error) {
	_, resp, err := s.fireEvent.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.FireEventResponse), nil
}

func NewGRPCServer(signalImpl signal.Implementation) pb.SignalServiceServer {
	endpoints := MakeEndpoints(signalImpl)

	return &grpcServer{
		fireEvent: kitgrpc.NewServer(
			endpoints.FireEvent,
			decodeFireEventRequest,
			encodeFireEventResponse,
		),
	}
}
