package grpc

import "bitbucket.org/ittinc/users-service/models"

type CreateOwnerRequest struct {
	models.OwnerCreateRequest
}

type CreateOwnerResponse struct {
	Success bool
}

type GetUserRequest struct {
	models.GetUserRequest
}

type GetUserResponse struct {
	User models.User
}

type GetUsersByIDRequest struct {
	models.GetUsersByIDRequest
}

type GetUsersByIDResponse struct {
	Users []models.User
}

type MultiplePermissionsEditRequest struct {
	TenantID string
	Data     []models.EditUser
}

type MultiplePermissionsEditResponse struct {
	Success bool
}

//type Error struct {
//	Message    string            `json:"message"`
//	Code       int32             `json:"code"`
//	Validation map[string]string `json:"validation"`
//}
