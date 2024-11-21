package auth

import (
	"context"
)

type Implementation interface {
	GetTokenInfo(ctx context.Context, tenantID, accessToken string) (string, int64, error)
	DoAuth(ctx context.Context, tenantID, accessToken string) (uint32, bool)
}
