package http

import (
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"bitbucket.org/ittinc/users-service/models"
)

type RegisterRequest struct {
	models.UserCreateRequest `valid:"optional"`
}

type RegisterResponse struct {
	User    models.User              `json:"user"`
	Tokens  tokens_manager.TokenPair `json:"tokens"`
	Company models.CompanyData       `json:"company"`
}

type LoginRequest struct {
	models.UserLoginRequest `valid:"optional"`
}

type LoginResponse struct {
	User    models.User              `json:"user"`
	Tokens  tokens_manager.TokenPair `json:"tokens"`
	Company models.CompanyData       `json:"company"`
}

type RefreshTokenRequest struct {
	models.RefreshTokenRequest `valid:"optional"`
}

type RefreshTokenResponse struct {
	User    models.User              `json:"user"`
	Tokens  tokens_manager.TokenPair `json:"tokens"`
	Company models.CompanyData       `json:"company"`
}

type LogoutRequest struct {
	models.LogoutRequest `valid:"optional"`
}

type LogoutResponse struct {
	Success bool `json:"success"`
}

type GetInvitedInfoRequest struct {
	models.GetInvitedInfo `valid:"optional"`
}

type GetInvitedInfoResponse struct {
	User    models.User        `json:"user"`
	Company models.CompanyData `json:"company"`
}

type GetUserRequest struct {
	UserID uint32 `valid:"required"`
}

type GetAllUsersRequest struct {
	WithPerms bool
}

type GetUserResponse struct {
	User    models.User        `json:"user"`
	Company models.CompanyData `json:"company"`
}

type GetAllUsersResponse struct {
	Users []models.User `json:"users"`
}

type PatchUserRequest struct {
	models.PatchUserRequest `valid:"optional"`
}

type PatchUserResponse struct {
	User models.User `json:"user"`
}

type InviteUserRequest struct {
	Users []models.InviteUser `valid:"required"`
}

type InviteUserResponse struct {
	Success    bool    `json:"success"`
	TempTokens *string `json:"tempTokens,omitempty"`
}

type CheckUserMetaExistsRequest struct {
	models.CheckUserMetaExistsRequest `valid:"optional"`
}

type CheckUserMetaExistsResponse struct {
	Exists bool `json:"exists"`
}

type MultipleUsersEditRequest struct {
	Users []models.EditUser `valid:"required"`
}

type MultipleUsersEditResponse struct {
	Success bool `json:"success"`
}

type MultipleUsersDeleteRequest struct {
	Users []uint32 `valid:"required"`
}

type MultipleUsersDeleteResponse struct {
	Success bool `json:"success"`
}

type MultipleUsersToggleBlockRequest struct {
	Users []uint32 `valid:"required"`
}

type MultipleUsersToggleBlockResponse struct {
	Success bool `json:"success"`
}

type WsEchoRequest struct {
	IDs     []uint32 `valid:"required"`
	Event   string   `valid:"required"`
	Payload string   `valid:"required"`
}

type WsEchoResponse struct {
	Success bool `json:"success"`
}
