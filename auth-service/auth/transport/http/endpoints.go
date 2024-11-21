package http

import (
	"bitbucket.org/ittinc/auth-service/auth"
	"bitbucket.org/ittinc/auth-service/models"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	DoAuth endpoint.Endpoint
}

func MakeEndpoints(s auth.Implementation) Endpoints {
	return Endpoints{
		DoAuth: makeAuthEndpoint(s),
	}
}

func makeAuthEndpoint(s auth.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(models.Auth)

		jwtPayload, success := s.DoAuth(ctx, body.TenantID, body.AccessToken)

		return models.AuthResult{
			JWTPayload: jwtPayload,
			TenantID:   body.TenantID,
			Success:    success,
		}, nil
	}
}
