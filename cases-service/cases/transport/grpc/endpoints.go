package grpc

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CountCases endpoint.Endpoint
}

func MakeEndpoints(s cases.Implementation) Endpoints {
	return Endpoints{
		CountCases: makeCountCasesEndpoint(s),
	}
}

func makeCountCasesEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(CountCasesRequest)

		result := s.CountCases(ctx, gr.TenantID, gr.Space)
		return CountCasesResponse{Result: result}, nil
	}
}
