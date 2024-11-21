package grpc

import (
	"bitbucket.org/ittinc/signal-service/signal"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	FireEvent endpoint.Endpoint
}

func MakeEndpoints(s signal.Implementation) Endpoints {
	return Endpoints{
		FireEvent: makeFireEventEndpoint(s),
	}
}

func makeFireEventEndpoint(s signal.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(FireEventRequest)

		result := s.FireEvent(ctx, gr.IDs, gr.TenantID, gr.Event, gr.Payload)
		return FireEventResponse{Success: result}, nil
	}
}
