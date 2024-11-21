package http

import (
	"bitbucket.org/ittinc/auth-service/models"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"context"
	"net/http"
	"strings"
)

func decodeAuthRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	// TODO: parse token with key from tenant
	tenantID := strings.Split(r.Host, ".")[:1][0]
	accessToken := tokens_manager.TokenFromHeader(r)

	return models.Auth{
		TenantID:    tenantID,
		AccessToken: accessToken,
	}, nil
}
