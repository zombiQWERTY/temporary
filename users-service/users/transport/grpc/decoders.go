package grpc

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/users-service/models"
	"bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
)

func decodeCreateOwnerRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.CreateOwnerRequest)
	return CreateOwnerRequest{
		models.OwnerCreateRequest{
			TenantID:  req.TenantID,
			Email:     req.Email,
			FirstName: req.FirstName,
			LastName:  req.LastName,
			Password:  req.Password,
		},
	}, nil
}

func decodeGetUserRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.GetUserRequest)
	return GetUserRequest{
		models.GetUserRequest{
			TenantID: req.TenantID,
			ID:       req.ID,
		},
	}, nil
}

func decodeGetUsersByIDRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.GetUsersByIDRequest)
	return GetUsersByIDRequest{
		models.GetUsersByIDRequest{
			TenantID: req.TenantID,
			ID:       req.IDs,
		},
	}, nil
}

func decodeMultiplePermissionsEditRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.MultiplePermissionsEditRequest)

	var data []models.EditUser
	for _, item := range req.PermissionsList {
		var tempPerms []shared_middleware.PermissionList
		for _, perm := range item.Permissions {
			tempPerms = append(tempPerms, shared_middleware.PermissionList{ID: perm.ID, Models: perm.Models})
		}

		p := models.EditUser{
			ID:          item.ID,
			Permissions: tempPerms,
		}

		data = append(data, p)
	}

	return MultiplePermissionsEditRequest{
		Data:     data,
		TenantID: req.TenantID,
	}, nil
}

func decodeCheckAccessRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.CheckAccessRequest)

	return models.CheckAccessRequest{
		TenantID: req.TenantID,
		PermName: req.PermName,
		UserID:   req.UserID,
		ModelIDs: req.ModelIDs,
	}, nil
}
