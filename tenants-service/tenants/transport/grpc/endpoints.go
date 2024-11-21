package grpc

import (
	"bitbucket.org/ittinc/tenants-service/models"
	"bitbucket.org/ittinc/tenants-service/tenants"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CreateTenant   endpoint.Endpoint
	GetCompanyInfo endpoint.Endpoint
}

func MakeEndpoints(s tenants.Implementation) Endpoints {
	return Endpoints{
		CreateTenant:   makeCreateTenantEndpoint(s),
		GetCompanyInfo: makeGetCompanyInfoEndpoint(s),
	}
}

func makeCreateTenantEndpoint(s tenants.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(CreateTenantRequest)
		result, _ := s.CreateTenant(ctx, gr.Name, gr.Domain)
		return CreateTenantResponse{Success: result}, nil
	}
}

func makeGetCompanyInfoEndpoint(s tenants.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(GetCompanyInfoRequest)
		result, _ := s.GetCompanyInfo(ctx, gr.TenantID)
		return GetCompanyInfoResponse{CompanyData: models.CompanyData{Name: result.Name}}, nil
	}
}
