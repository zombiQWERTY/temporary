package grpc

import (
	"bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"context"
)

func decodeCreateTenantRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.CreateTenantRequest)
	return CreateTenantRequest{Name: req.Name, Domain: req.Domain}, nil
}

func decodeGetCompanyInfoRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.GetCompanyInfoRequest)
	return GetCompanyInfoRequest{TenantID: req.TenantID}, nil
}
