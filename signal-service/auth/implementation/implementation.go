package implementation

import (
	authPB "bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/signal-service/auth"
	"context"
	"fmt"
	"github.com/sirupsen/logrus"
	"strings"
)

type AuthImpl struct {
	serviceDiscovery service_discovery.ServiceDiscovery
	authClient       func() (authPB.AuthServiceClient, error)
	log              *logger.Logger
}

func NewAuthImpl(serviceDiscovery service_discovery.ServiceDiscovery, log *logrus.Entry, authClient func() (authPB.AuthServiceClient, error)) auth.Implementation {
	return &AuthImpl{
		serviceDiscovery: serviceDiscovery,
		authClient:       authClient,
		log:              logger.UseLogger(log),
	}
}

func (u *AuthImpl) GetTokenInfo(ctx context.Context, tenantID, accessToken string) (string, int64, error) {
	log := u.log.TenantID(tenantID).Method("GetTokenInfo")

	{
		tokenType := "BEARER"
		tokenTypeLength := len(tokenType + " ")
		if len(accessToken) > tokenTypeLength && strings.ToUpper(accessToken[0:len(tokenType)]) == "BEARER" {
			accessToken = accessToken[tokenTypeLength:]
		}
	}

	authClient, err := u.authClient()
	if err != nil {
		log.AuthDownError(err)
		return "", 0, shared_errors.ErrAuthDown
	}

	tenantDomain := u.serviceDiscovery.GetValueByKey("tenants/" + tenantID)
	if tenantDomain == nil {
		log.Logger.Error("not usual behaviour, tenantDomain not found")
		return "", 0, shared_errors.ErrForbidden
	}

	key := fmt.Sprintf("tokens:%s:%s", tenantID, accessToken)
	resp, err := authClient.ReadFromRedisWithEx(context.Background(), &authPB.ReadFromRedisRequest{TenantID: tenantID, Key: key})
	if err != nil || !resp.Success {
		log.AuthDownError(err)
		return "", 0, shared_errors.ErrForbidden
	}

	return resp.Value, resp.Ex, nil
}

func (u *AuthImpl) DoAuth(ctx context.Context, tenantID, accessToken string) (uint32, bool) {
	log := u.log.TenantID(tenantID).Method("DoAuth")

	authClient, err := u.authClient()
	if err != nil {
		log.AuthDownError(err)
		return 0, false
	}

	tenantDomain := u.serviceDiscovery.GetValueByKey("tenants/" + tenantID)
	if tenantDomain == nil {
		log.Logger.Error("not usual behaviour, tenantDomain not found")
		return 0, false
	}

	resp, err := authClient.DoAuth(context.Background(), &authPB.DoAuthRequest{TenantID: tenantID, AccessToken: accessToken})
	if err != nil || !resp.Success {
		log.AuthDownError(err)
		return 0, false
	}

	return resp.UserID, resp.Success
}
