package users

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/users-service/models"
	"context"
)

type Repository interface {
	Register(ctx context.Context, registerData models.User, id uint32) (*models.User, error)
	Login(ctx context.Context, loginData models.Login) (*models.User, error)
	RefreshToken(ctx context.Context, data models.RefreshToken, ID uint32) (*models.User, error)
	Logout(ctx context.Context, data models.Logout) error
	GetUser(ctx context.Context, id uint32) (*models.User, error)
	GetAllUsers(ctx context.Context) ([]models.User, error)
	GetUsersByID(ctx context.Context, IDs []uint32) ([]models.User, error)
	PatchUser(ctx context.Context, data interface{}, id uint32) (*models.User, error)
	InviteUser(ctx context.Context, data models.User, permissions []shared_middleware.PermissionList) (*models.User, error)
	CheckUserMetaExists(ctx context.Context, data models.CheckUserMetaExistsRequest) (*bool, error)
	GetMyPermissions(ctx context.Context, ID uint32) ([]shared_middleware.PermissionList, error)
	GetUserListPermissions(ctx context.Context, IDs []uint32) ([]shared_middleware.PermissionList, error)
	EditPermissions(ctx context.Context, userID uint32, permissions []shared_middleware.PermissionList, correlateWithIssuer bool) error
	GetAllPermissions(ctx context.Context) ([]models.Permission, error)
	MultipleUsersDelete(ctx context.Context, users []uint32) error
	MultipleUsersToggleBlock(ctx context.Context, users []uint32, blockStatus bool) error
	CheckAccess(ctx context.Context, permName string, userID uint32, modelIDs []uint32) (models.CheckAccessResponse, error)
}
