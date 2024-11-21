package grpc

import (
	"bitbucket.org/ittinc/tenants-service/tenants"
	"bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"context"
	kitgrpc "github.com/go-kit/kit/transport/grpc"
)

type grpcServer struct {
	createTenant   kitgrpc.Handler
	getCompanyInfo kitgrpc.Handler
}

func (s *grpcServer) CreateTenant(ctx context.Context, r *pb.CreateTenantRequest) (*pb.CreateTenantResponse, error) {
	_, resp, err := s.createTenant.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.CreateTenantResponse), nil
}

func (s *grpcServer) GetCompanyInfo(ctx context.Context, r *pb.GetCompanyInfoRequest) (*pb.GetCompanyInfoResponse, error) {
	_, resp, err := s.getCompanyInfo.ServeGRPC(ctx, r)
	if err != nil {
		return nil, err
	}

	return resp.(*pb.GetCompanyInfoResponse), nil
}

func NewGRPCServer(tenantsImpl tenants.Implementation) pb.TenantsServiceServer {
	endpoints := MakeEndpoints(tenantsImpl)

	return &grpcServer{
		createTenant: kitgrpc.NewServer(
			endpoints.CreateTenant,
			decodeCreateTenantRequest,
			encodeCreateTenantResponse,
		),
		getCompanyInfo: kitgrpc.NewServer(
			endpoints.GetCompanyInfo,
			decodeGetCompanyInfoRequest,
			encodeGetCompanyInfoResponse,
		),
	}
}
