package grpc

import (
	"bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"context"
)

func encodeCreateTenantResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(CreateTenantResponse)
	return &pb.CreateTenantResponse{Success: res.Success}, nil
}

func encodeGetCompanyInfoResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(GetCompanyInfoResponse)
	return &pb.GetCompanyInfoResponse{Name: res.CompanyData.Name}, nil
}
