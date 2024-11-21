package grpc

import (
	"bitbucket.org/ittinc/auth-service/auth"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	WriteToRedis        endpoint.Endpoint
	ReadFromRedis       endpoint.Endpoint
	ReadFromRedisWithEx endpoint.Endpoint
	DoAuth              endpoint.Endpoint
}

func MakeEndpoints(s auth.Implementation) Endpoints {
	return Endpoints{
		WriteToRedis:        makeWriteToRedisEndpoint(s),
		ReadFromRedis:       makeReadFromRedisEndpoint(s),
		ReadFromRedisWithEx: makeReadFromRedisWithExEndpoint(s),
		DoAuth:              makeDoAuthEndpoint(s),
	}
}

func makeWriteToRedisEndpoint(s auth.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(WriteToRedisRequest)
		result, _ := s.WriteToRedis(ctx, gr.TenantID, gr.Key, gr.Value, gr.Ex)
		return WriteToRedisResponse{Success: result}, nil
	}
}

func makeReadFromRedisEndpoint(s auth.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(ReadFromRedisRequest)
		result, value, _ := s.ReadFromRedis(ctx, gr.TenantID, gr.Key)
		return ReadFromRedisResponse{Success: result, Value: value}, nil
	}
}

func makeReadFromRedisWithExEndpoint(s auth.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(ReadFromRedisRequest)
		result, value, ex, _ := s.ReadFromRedisWithEx(ctx, gr.TenantID, gr.Key)
		return ReadFromRedisWithExResponse{Success: result, Value: value, Ex: ex}, nil
	}
}

func makeDoAuthEndpoint(s auth.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(DoAuthRequest)
		result, success := s.DoAuth(ctx, gr.TenantID, gr.AccessToken)
		if success {
			return DoAuthResponse{Success: success, UserID: result.ID}, nil
		}

		return DoAuthResponse{Success: false}, nil
	}
}
