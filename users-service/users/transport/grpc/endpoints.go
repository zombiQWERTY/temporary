package grpc

import (
	"bitbucket.org/ittinc/users-service/models"
	"bitbucket.org/ittinc/users-service/users"
	"context"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CreateOwner             endpoint.Endpoint
	GetUser                 endpoint.Endpoint
	GetUsersByID            endpoint.Endpoint
	MultiplePermissionsEdit endpoint.Endpoint
	CheckAccess             endpoint.Endpoint
}

func MakeEndpoints(s users.Implementation) Endpoints {
	return Endpoints{
		CreateOwner:             makeCreateOwnerEndpoint(s),
		GetUser:                 makeGetUserEndpoint(s),
		GetUsersByID:            makeGetUsersByIDEndpoint(s),
		MultiplePermissionsEdit: makeMultiplePermissionsEditEndpoint(s),
		CheckAccess:             makeCheckAccessEndpoint(s),
	}
}

func makeCreateOwnerEndpoint(s users.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(CreateOwnerRequest)
		_, err := s.CreateOwner(ctx, gr.OwnerCreateRequest)

		if err != nil {
			return CreateOwnerResponse{Success: false}, err
		}

		return CreateOwnerResponse{Success: true}, nil
	}
}

func makeGetUserEndpoint(s users.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(GetUserRequest)
		ctx = context.WithValue(ctx, "tenant", gr.GetUserRequest.TenantID)

		user, err := s.GetUser(ctx, gr.GetUserRequest.ID)

		if err != nil || user == nil {
			return GetUserResponse{User: models.User{}}, err
		}

		return GetUserResponse{User: *user}, nil
	}
}

func makeGetUsersByIDEndpoint(s users.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(GetUsersByIDRequest)
		ctx = context.WithValue(ctx, "tenant", gr.GetUsersByIDRequest.TenantID)

		u, err := s.GetUsersByID(ctx, gr.GetUsersByIDRequest.ID)

		if err != nil || len(u) == 0 {
			return GetUsersByIDResponse{Users: []models.User{}}, err
		}

		return GetUsersByIDResponse{Users: u}, nil
	}
}

func makeMultiplePermissionsEditEndpoint(s users.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(MultiplePermissionsEditRequest)
		ctx = context.WithValue(ctx, "tenant", gr.TenantID)

		err := s.MultiplePermissionsEdit(ctx, gr.Data, false)

		if err != nil {
			return MultiplePermissionsEditResponse{Success: false}, err
		}

		return MultiplePermissionsEditResponse{Success: true}, nil
	}
}

func makeCheckAccessEndpoint(s users.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		gr := req.(models.CheckAccessRequest)
		ctx = context.WithValue(ctx, "tenant", gr.TenantID)
		hasAccess := s.CheckAccess(ctx, gr.PermName, gr.UserID, gr.ModelIDs)
		return hasAccess, nil
	}
}
