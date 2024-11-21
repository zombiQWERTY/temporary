package http

import (
	"bitbucket.org/ittinc/landing-service/landing"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CreateCompany endpoint.Endpoint
}

func MakeEndpoints(s landing.Implementation) Endpoints {
	return Endpoints{
		CreateCompany: makeCreateCompanyEndpoint(s),
	}
}

func makeCreateCompanyEndpoint(s landing.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		//logger := requestID.NewLoggerFromReqIDCtx(ctx, log.Logger()).WithField("method", "makeCreateUserEndpoint")
		// TODO: Check success payment

		body := request.(CreateCompanyRequest)
		err := s.CreateCompany(ctx, body.CompanyCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateCompanyResponse{
			Success: true,
		}, nil
	}
}
