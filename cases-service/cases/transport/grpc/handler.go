package grpc

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	countCases kitgrpc.Handler
}

func (s *grpcServer) CountCases(ctx context.Context, r *pb.CountCasesRequest) (*pb.CountCasesResponse, error) {
	_, resp, err := s.countCases.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.CountCasesResponse), nil
}

func NewGRPCServer(casesImpl cases.Implementation) pb.CasesServiceServer {
	endpoints := MakeEndpoints(casesImpl)

	return &grpcServer{
		countCases: kitgrpc.NewServer(
			endpoints.CountCases,
			decodeCountCasesRequest,
			encodeCountCasesResponse,
		),
	}
}
