package grpc

import (
	"bitbucket.org/ittinc/users-service/models"
	"bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
)

func encodeCreateOwnerResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(CreateOwnerResponse)
	return &pb.CreateOwnerResponse{Success: res.Success}, nil
}

func encodeGetUserResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(GetUserResponse)

	phone := ""
	if res.User.Phone != nil {
		phone = *res.User.Phone
	}

	return &pb.GetUserResponse{
		ID:        res.User.ID,
		Email:     res.User.Email,
		FirstName: res.User.FirstName,
		LastName:  res.User.LastName,
		Phone:     phone,
		Status:    string(res.User.Status),
	}, nil
}

func encodeGetUsersByIDResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(GetUsersByIDResponse)

	var users []*pb.GetUserResponse
	for _, u := range res.Users {
		phone := ""
		if u.Phone != nil {
			phone = *u.Phone
		}

		users = append(users, &pb.GetUserResponse{
			ID:        u.ID,
			Email:     u.Email,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Phone:     phone,
			Status:    string(u.Status),
		})
	}

	return &pb.GetUsersByIDResponse{
		Users: users,
	}, nil
}

func encodeMultiplePermissionsEditResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(MultiplePermissionsEditResponse)
	return &pb.MultiplePermissionsEditResponse{Success: res.Success}, nil
}

func encodeCheckAccessResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(models.CheckAccessResponse)

	var resp []*pb.AccessByModelID
	for _, p := range res.Access {
		resp = append(resp, &pb.AccessByModelID{
			ModelID:   p.ModelID,
			HasAccess: p.HasAccess,
		})
	}

	return &pb.CheckAccessResponse{Access: resp}, nil
}
