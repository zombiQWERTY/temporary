package models

import (
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
)

type Auth struct {
	TenantID    string
	AccessToken string
}

type AuthResult struct {
	JWTPayload *tokens_manager.JwtPayload
	TenantID   string
	Success    bool
}
