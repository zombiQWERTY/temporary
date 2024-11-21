package users

import (
	"bitbucket.org/ittinc/users-service/models"
	"context"
	"crypto/rsa"
)

type Implementation interface {
	Register(ctx context.Context, registerData models.UserCreateRequest) (*models.User, error)
	CreateOwner(ctx context.Context, data models.OwnerCreateRequest) (*models.User, error)
	Login(ctx context.Context, loginData models.UserLoginRequest) (*models.User, error)
	RefreshToken(ctx context.Context, data models.RefreshTokenRequest, ID uint32) (*models.User, error)
	Logout(ctx context.Context, data models.LogoutRequest) error
	GetUser(ctx context.Context, id uint32) (*models.User, error)
	GetAllUsers(ctx context.Context, withPerms bool) ([]models.User, error)
	GetUsersByID(ctx context.Context, IDs []uint32) ([]models.User, error)
	PatchUser(ctx context.Context, data models.PatchUserRequest, id uint32) (*models.User, error)
	InviteUser(ctx context.Context, data []models.InviteUser) (*string, error)
	CheckUserMetaExists(ctx context.Context, data models.CheckUserMetaExistsRequest) (*bool, error)
	SaveToken(ctx context.Context, userID uint32, hash, token string, exp int64) error
	GetTokenInfo(ctx context.Context, token string) (string, error)
	MultipleUsersEdit(ctx context.Context, data []models.EditUser) error
	MultiplePermissionsEdit(ctx context.Context, data []models.EditUser, correlateWithIssuer bool) error
	GetPrivateKey(ctx context.Context, id uint32) (*rsa.PrivateKey, error)
	GetInvitedInfo(ctx context.Context, token string) (*models.User, error)
	MultipleUsersDelete(ctx context.Context, users []uint32) error
	MultipleUsersToggleBlock(ctx context.Context, users []uint32, blockStatus bool) error
	WsEcho(ctx context.Context, IDs []uint32, event, payload string) error
	GetCompanyInfo(ctx context.Context) (*models.CompanyData, error)
	CheckAccess(ctx context.Context, permName string, userID uint32, modelIDs []uint32) models.CheckAccessResponse
	CheckAccessCtx(ctx context.Context, permName string, args ...interface{}) models.CheckAccessResponse
	CheckAccessSingleCtx(ctx context.Context, permName string) bool
}
