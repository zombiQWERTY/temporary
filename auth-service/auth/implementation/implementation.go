package implementation

import (
	"bitbucket.org/ittinc/auth-service/auth"
	"bitbucket.org/ittinc/auth-service/model"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
	"crypto/rsa"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v7"
	"github.com/sirupsen/logrus"
	"strconv"
	"strings"
	"time"
)

type AuthImpl struct {
	redisClient      func() (*redis.Client, error)
	usersClient      func() (usersPB.UsersServiceClient, error)
	serviceDiscovery service_discovery.ServiceDiscovery
	log              *logger.Logger
}

func NewAuthImpl(serviceDiscovery service_discovery.ServiceDiscovery, log *logrus.Entry, redisClient func() (*redis.Client, error), usersClient func() (usersPB.UsersServiceClient, error)) auth.Implementation {
	return &AuthImpl{
		serviceDiscovery: serviceDiscovery,
		redisClient:      redisClient,
		usersClient:      usersClient,
		log:              logger.UseLogger(log),
	}
}

func (u *AuthImpl) DoAuth(ctx context.Context, tenantID, accessToken string) (*tokens_manager.JwtPayload, bool) {
	log := u.log.TenantID(tenantID).Method("DoAuth")

	tenantDomain := u.serviceDiscovery.GetValueByKey("tenants/" + tenantID)
	if tenantDomain == nil {
		log.Logger.Error("not usual behaviour, tenantDomain not found")
		return nil, false
	}

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return nil, false
	}

	keyToken := fmt.Sprintf("tokens:%s:%s", tenantID, accessToken)
	userDataFromRedis, err := redisClient.Get(keyToken).Result()
	if err != nil {
		if err != redis.Nil {
			log.WithError(err).WithField("accessToken", accessToken).Error("Cant get user id by accessToken from redis")
		}

		return nil, false
	}

	userDataSlice := strings.Split(userDataFromRedis, ":::")
	userID := userDataSlice[0]
	accessToken = userDataSlice[1]

	usersClient, err := u.usersClient()
	if err != nil {
		log.WithError(err).Error("Users down")
		return nil, false
	}

	userID64, _ := strconv.ParseUint(userID, 10, 32)
	userData, err := usersClient.GetUser(ctx, &usersPB.GetUserRequest{ID: uint32(userID64), TenantID: tenantID})
	if err != nil {
		log.WithError(err).Error("Users down")
		return nil, false
	}

	if userData.Status == "blocked" || userData.Status == "removed" {
		return nil, false
	}

	keyRelogin := fmt.Sprintf("needReLogin:%s:%s", tenantID, userID) // Checking for need reLogin
	reloginID, err := redisClient.Get(keyRelogin).Result()
	if err != nil {
		if err != redis.Nil {
			log.WithError(err).WithField("accessToken", accessToken).Error("Cant get user id by needReLogin from redis")
			return nil, false
		}
	}

	if len(reloginID) != 0 {
		_, err = redisClient.Del(keyRelogin).Result()
		if err != nil {
			log.WithError(err).WithField("accessToken", accessToken).Error("Cant delete needReLogin entry from redis")
			return nil, false
		}

		return nil, false
	}

	privateKey, err := u.GetPrivateKey(ctx, tenantID, uint32(userID64))
	if err != nil {
		return nil, false
	}

	claims, err := tokens_manager.Decrypt(privateKey, accessToken)
	if err != nil {
		log.WithError(err).WithField("accessToken", accessToken).Error("Access token decrypt error")
		return nil, false
	}

	tokenValid := tokens_manager.Validate(claims)
	if !tokenValid {
		return nil, false
	}

	if uint32(userID64) != claims.JwtPayload.ID {
		log.User(userID).Logger.WithField("JwtPayload", claims.JwtPayload).Error("Strange behaviour")
		return nil, false
	}

	return &claims.JwtPayload, true
}

func (u *AuthImpl) WriteToRedis(ctx context.Context, tenantID, key, value string, ex int64) (bool, error) {
	log := u.log.TenantID(tenantID).Method("WriteToRedis")

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return false, err
	}

	expireIn := time.Duration(ex)
	_, err = redisClient.Set(key, value, expireIn).Result()
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{
			"key":   key,
			"value": value,
			"ex":    ex,
		}).Error("Cant set into redis key with value")
		return false, err
	}

	return true, nil
}

func (u *AuthImpl) ReadFromRedis(ctx context.Context, tenantID, key string) (bool, string, error) {
	log := u.log.TenantID(tenantID).Method("ReadFromRedis")

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return false, "", err
	}

	res, err := redisClient.Get(key).Result()
	if err != nil {
		if err != redis.Nil {
			log.WithError(err).WithField("key", key).Error("Cant read redis key value")
			return false, "", err
		}

		return true, "", nil
	}

	return true, res, nil
}

func (u *AuthImpl) ReadFromRedisWithEx(ctx context.Context, tenantID, key string) (bool, string, time.Duration, error) {
	log := u.log.TenantID(tenantID).Method("ReadFromRedisWithEx")

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return false, "", 0, err
	}

	res, err := redisClient.TTL(key).Result()
	if err != nil {
		if err != redis.Nil {
			log.WithError(err).WithField("key", key).Error("Cant read redis key ttl")
			return false, "", 0, err
		}

		return true, "", 0, nil
	}

	success, value, err := u.ReadFromRedis(ctx, tenantID, key)
	if err != nil || !success {
		return false, "", 0, err
	}

	return true, value, res, nil
}

func (u *AuthImpl) GetPrivateKey(ctx context.Context, tenantID string, id uint32) (*rsa.PrivateKey, error) {
	log := u.log.TenantID(tenantID).Method("GetPrivateKey")

	sdKey := fmt.Sprintf("%s%s/privateKey", model.TENANTS_KEY, tenantID) // tenants/:tenant/privateKey
	privateKeyBytes := u.serviceDiscovery.GetValueByKey(sdKey)
	if privateKeyBytes == nil {
		log.User(id).Logger.Error("Cant get private key from consul")
		return nil, errors.New("cant get private key from consul")
	}

	pKey, headers, err := tokens_manager.DecodePrivateKey([]byte(*privateKeyBytes))
	if err != nil {
		log.User(id).Logger.Error("Cant decode private key from consul")
		return nil, errors.New("cant decode private key from consul")
	}

	if headers["tenant"] != tenantID {
		log.User(id).Logger.Error("Invalid token?")
		return nil, errors.New("invalid token")
	}

	return pKey, nil
}
