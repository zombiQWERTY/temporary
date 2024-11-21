package auth

import (
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"context"
	"time"
)

type Implementation interface {
	DoAuth(ctx context.Context, tenantID, accessToken string) (*tokens_manager.JwtPayload, bool)
	WriteToRedis(ctx context.Context, tenantID, key, value string, ex int64) (bool, error)
	ReadFromRedis(ctx context.Context, tenantID, key string) (bool, string, error)
	ReadFromRedisWithEx(ctx context.Context, tenantID, key string) (bool, string, time.Duration, error)
}
