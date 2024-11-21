package grpc

import (
	"bitbucket.org/ittinc/auth-service/auth"
	"bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	writeToRedis        kitgrpc.Handler
	readFromRedis       kitgrpc.Handler
	readFromRedisWithEx kitgrpc.Handler
	doAuth              kitgrpc.Handler
}

func (s *grpcServer) WriteToRedis(ctx context.Context, r *pb.WriteToRedisRequest) (*pb.WriteToRedisResponse, error) {
	_, resp, err := s.writeToRedis.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.WriteToRedisResponse), nil
}

func (s *grpcServer) ReadFromRedis(ctx context.Context, r *pb.ReadFromRedisRequest) (*pb.ReadFromRedisResponse, error) {
	_, resp, err := s.readFromRedis.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.ReadFromRedisResponse), nil
}

func (s *grpcServer) ReadFromRedisWithEx(ctx context.Context, r *pb.ReadFromRedisRequest) (*pb.ReadFromRedisWithExResponse, error) {
	_, resp, err := s.readFromRedisWithEx.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.ReadFromRedisWithExResponse), nil
}

func (s *grpcServer) DoAuth(ctx context.Context, r *pb.DoAuthRequest) (*pb.DoAuthResponse, error) {
	_, resp, err := s.doAuth.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.DoAuthResponse), nil
}

func NewGRPCServer(authImpl auth.Implementation) pb.AuthServiceServer {
	endpoints := MakeEndpoints(authImpl)

	return &grpcServer{
		writeToRedis: kitgrpc.NewServer(
			endpoints.WriteToRedis,
			decodeWriteToRedisRequest,
			encodeWriteToRedisResponse,
		),
		readFromRedis: kitgrpc.NewServer(
			endpoints.ReadFromRedis,
			decodeReadFromRedisRequest,
			encodeReadFromRedisResponse,
		),
		readFromRedisWithEx: kitgrpc.NewServer(
			endpoints.ReadFromRedisWithEx,
			decodeReadFromRedisRequest,
			encodeReadFromRedisWithExResponse,
		),
		doAuth: kitgrpc.NewServer(
			endpoints.DoAuth,
			decodeDoAuthRequest,
			encodeDoAuthResponse,
		),
	}
}
