package grpc

import (
	"bitbucket.org/ittinc/users-service/users"
	"bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	createOwner             kitgrpc.Handler
	getUser                 kitgrpc.Handler
	getUsersByID            kitgrpc.Handler
	multiplePermissionsEdit kitgrpc.Handler
	checkAccess             kitgrpc.Handler
}

func (s *grpcServer) CreateOwner(ctx context.Context, r *pb.CreateOwnerRequest) (*pb.CreateOwnerResponse, error) {
	_, resp, err := s.createOwner.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.CreateOwnerResponse), nil
}

func (s *grpcServer) GetUser(ctx context.Context, r *pb.GetUserRequest) (*pb.GetUserResponse, error) {
	_, resp, err := s.getUser.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.GetUserResponse), nil
}

func (s *grpcServer) GetUsersByID(ctx context.Context, r *pb.GetUsersByIDRequest) (*pb.GetUsersByIDResponse, error) {
	_, resp, err := s.getUsersByID.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.GetUsersByIDResponse), nil
}

func (s *grpcServer) MultiplePermissionsEdit(ctx context.Context, r *pb.MultiplePermissionsEditRequest) (*pb.MultiplePermissionsEditResponse, error) {
	_, resp, err := s.multiplePermissionsEdit.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.MultiplePermissionsEditResponse), nil
}

func (s *grpcServer) CheckAccess(ctx context.Context, r *pb.CheckAccessRequest) (*pb.CheckAccessResponse, error) {
	_, resp, err := s.checkAccess.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.CheckAccessResponse), nil
}

func NewGRPCServer(authImpl users.Implementation) pb.UsersServiceServer {
	endpoints := MakeEndpoints(authImpl)

	return &grpcServer{
		createOwner: kitgrpc.NewServer(
			endpoints.CreateOwner,
			decodeCreateOwnerRequest,
			encodeCreateOwnerResponse,
		),
		getUser: kitgrpc.NewServer(
			endpoints.GetUser,
			decodeGetUserRequest,
			encodeGetUserResponse,
		),
		getUsersByID: kitgrpc.NewServer(
			endpoints.GetUsersByID,
			decodeGetUsersByIDRequest,
			encodeGetUsersByIDResponse,
		),
		multiplePermissionsEdit: kitgrpc.NewServer(
			endpoints.MultiplePermissionsEdit,
			decodeMultiplePermissionsEditRequest,
			encodeMultiplePermissionsEditResponse,
		),
		checkAccess: kitgrpc.NewServer(
			endpoints.CheckAccess,
			decodeCheckAccessRequest,
			encodeCheckAccessResponse,
		),
	}
}
