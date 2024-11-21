package grpc

import (
	"bitbucket.org/ittinc/mailer-service/mailer"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	Send endpoint.Endpoint
}

func MakeEndpoints(s mailer.Implementation) Endpoints {
	return Endpoints{
		Send: makeSendEndpoint(s),
	}
}

func makeSendEndpoint(s mailer.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(SendRequest)
		res, err := s.Send(ctx, body.Data)
		if err != nil {
			return nil, err
		}

		return &SendResponse{
			Success: res,
		}, nil
	}
}
