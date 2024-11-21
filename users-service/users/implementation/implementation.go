package implementation

import (
	authPB "bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	mailerPB "bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	signalPB "bitbucket.org/ittinc/signal-service/signal_grpc/pb"
	tenantsPB "bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	"bitbucket.org/ittinc/users-service/model"
	"crypto/rsa"
	"emperror.dev/errors"
	"encoding/json"
	"fmt"
	"github.com/sirupsen/logrus"
	"strconv"
	"strings"
	"time"

	"bitbucket.org/ittinc/users-service/models"

	"bitbucket.org/ittinc/users-service/users"
	"bitbucket.org/ittinc/users-service/users/implementation/password"
	"context"
	"crypto/sha1"
	"github.com/go-redis/redis/v7"
)

type UsersImpl struct {
	usersRepo     users.Repository
	log           *logger.Logger
	consulService service_discovery.ServiceDiscovery
	authClient    func() (authPB.AuthServiceClient, error)
	signalClient  func() (signalPB.SignalServiceClient, error)
	mailerClient  func() (mailerPB.MailerServiceClient, error)
	tenantsClient func() (tenantsPB.TenantsServiceClient, error)
	redisClient   func() (*redis.Client, error)
}

func NewUsersImpl(usersRepo users.Repository, consulService service_discovery.ServiceDiscovery, log *logrus.Entry, authClient func() (authPB.AuthServiceClient, error), mailerClient func() (mailerPB.MailerServiceClient, error), tenantsClient func() (tenantsPB.TenantsServiceClient, error), redisClient func() (*redis.Client, error), signalClient func() (signalPB.SignalServiceClient, error)) users.Implementation {
	return &UsersImpl{
		usersRepo:     usersRepo,
		log:           logger.UseLogger(log),
		consulService: consulService,
		authClient:    authClient,
		signalClient:  signalClient,
		mailerClient:  mailerClient,
		tenantsClient: tenantsClient,
		redisClient:   redisClient,
	}
}

var passMaker = password.NewPassword(sha1.New, 8, 32, 4096)

func (u *UsersImpl) Register(ctx context.Context, data models.UserCreateRequest) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("Register")

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return nil, shared_errors.ErrSomethingWentWrong
	}

	key := fmt.Sprintf("%s:%s:%s", tenantID, model.APP_SERVICE_NAME, data.Token)
	foundID, err := redisClient.Get(key).Result()

	if err != nil {
		if err == redis.Nil {
			return nil, shared_errors.ErrInviteLinkNotFound
		} else {
			log.User(foundID).RedisDownError(err)
			return nil, shared_errors.ErrSomethingWentWrong
		}
	}

	id, err := strconv.ParseInt(foundID, 0, 0)
	if err != nil {
		log.User(foundID).Logger.Error("Cant parse user id")
		return nil, shared_errors.ErrSomethingWentWrong
	}

	hashed := passMaker.HashPassword(data.Password)

	user := models.User{
		Phone:     data.Phone,
		FirstName: data.FirstName,
		LastName:  data.LastName,
		Password:  hashed.CipherText,
		ShortName: data.ShortName,
		OtherInfo: data.OtherInfo,
		Salt:      hashed.Salt,
		Status:    models.UserActive,
	}

	createdUser, err := u.usersRepo.Register(ctx, user, uint32(id))
	if err != nil {
		return nil, err
	}

	permissions, err := u.usersRepo.GetMyPermissions(ctx, createdUser.ID)
	if err != nil {
		return nil, err
	}

	createdUser.PermissionList = permissions

	redisClient.Del(key)

	return createdUser, nil
}

func (u *UsersImpl) GetInvitedInfo(ctx context.Context, token string) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetInvitedInfo")

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return nil, shared_errors.ErrSomethingWentWrong
	}

	key := fmt.Sprintf("%s:%s:%s", tenantID, model.APP_SERVICE_NAME, token)
	foundID, err := redisClient.Get(key).Result()

	if err != nil {
		if err == redis.Nil {
			return nil, shared_errors.ErrInviteLinkNotFound
		} else {
			log.User(foundID).RedisDownError(err)
			return nil, shared_errors.ErrSomethingWentWrong
		}
	}

	id, err := strconv.ParseInt(foundID, 0, 0)
	if err != nil {
		log.User(foundID).Logger.Error("Cant parse user id")
		return nil, shared_errors.ErrSomethingWentWrong
	}

	user, err := u.usersRepo.GetUser(ctx, uint32(id))
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (u *UsersImpl) Login(ctx context.Context, data models.UserLoginRequest) (*models.User, error) {
	user, err := u.usersRepo.Login(ctx, models.Login{Email: data.Email})
	if err != nil {
		return nil, err
	}

	passwordMatched := passMaker.VerifyPassword(data.Password, user.Password, user.Salt)
	if !passwordMatched {
		return nil, shared_errors.ErrUserNotFound
	}

	permissions, err := u.usersRepo.GetMyPermissions(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	user.PermissionList = permissions

	return user, nil
}

func (u *UsersImpl) GetPrivateKey(ctx context.Context, id uint32) (*rsa.PrivateKey, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetPrivateKey")

	sdKey := fmt.Sprintf("%s%s/privateKey", model.TENANTS_KEY, tenantID) // /tenants/:tenant/privateKey
	privateKeyBytes := u.consulService.GetValueByKey(sdKey)
	if privateKeyBytes == nil {
		log.User(id).Logger.Error("Cant get private key from consul. Empty bytes")
		return nil, shared_errors.ErrSomethingWentWrong
	}

	pKey, headers, err := tokens_manager.DecodePrivateKey([]byte(*privateKeyBytes))
	if err != nil {
		log.User(id).Logger.Error("Cant decode private key from consul")
		return nil, shared_errors.ErrSomethingWentWrong
	}

	if headers["tenant"] != tenantID {
		log.User(id).Logger.Error("Invalid token?")
		return nil, shared_errors.ErrSomethingWentWrong
	}

	return pKey, nil
}

func (u *UsersImpl) RefreshToken(ctx context.Context, data models.RefreshTokenRequest, ID uint32) (*models.User, error) {
	//tenantID := shared_middleware.ParseContextTenantModel(ctx)
	//logger := requestID.NewLoggerFromReqIDCtx(ctx, log.LoggerT(tenantID, u.log)).WithField("method", "RefreshToken")

	// TODO: check access token in auth_redis, then remove old access token from auth_redis
	user, err := u.usersRepo.RefreshToken(ctx, models.RefreshToken{RefreshToken: data.RefreshToken}, ID)
	if err != nil {
		return nil, err
	}

	permissions, err := u.usersRepo.GetMyPermissions(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	user.PermissionList = permissions

	return user, nil
}

func (u *UsersImpl) Logout(ctx context.Context, data models.LogoutRequest) error {
	//tenantID := shared_middleware.ParseContextTenantModel(ctx)
	//logger := requestID.NewLoggerFromReqIDCtx(ctx, log.LoggerT(tenantID, u.log)).WithField("method", "Logout")

	// TODO: remove old access token from auth_redis

	return nil
}

func (u *UsersImpl) GetUser(ctx context.Context, id uint32) (*models.User, error) {
	usr, err := u.usersRepo.GetUser(ctx, id)
	if err != nil {
		return nil, err
	}

	permissions, err := u.usersRepo.GetMyPermissions(ctx, usr.ID)
	if err != nil {
		return nil, err
	}

	usr.PermissionList = permissions
	return usr, nil
}

func (u *UsersImpl) GetAllUsers(ctx context.Context, withPerms bool) ([]models.User, error) {
	userList, err := u.usersRepo.GetAllUsers(ctx)
	if err != nil {
		return []models.User{}, err
	}

	if !withPerms {
		return userList, nil
	}

	var ids []uint32
	for _, usr := range userList {
		ids = append(ids, usr.ID)
	}

	permissionsList, err := u.usersRepo.GetUserListPermissions(ctx, ids)
	if err != nil {
		return nil, err
	}

	for index, usr := range userList {
		var perms []shared_middleware.PermissionList
		for _, perm := range permissionsList {
			if usr.ID == perm.UserID {
				perms = append(perms, perm)
			}
		}

		userList[index].PermissionList = perms
	}

	return userList, nil
}

func (u *UsersImpl) GetUsersByID(ctx context.Context, IDs []uint32) ([]models.User, error) {
	userList, err := u.usersRepo.GetUsersByID(ctx, IDs)
	if err != nil {
		return []models.User{}, err
	}

	return userList, nil
}

func (u *UsersImpl) PatchUser(ctx context.Context, data models.PatchUserRequest, id uint32) (*models.User, error) {
	return u.usersRepo.PatchUser(ctx, data, id)
}

func (u *UsersImpl) InviteUser(ctx context.Context, data []models.InviteUser) (*string, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("InviteUser")

	type content struct {
		Token string `json:"token"`
		Email string `json:"email"`
	}

	const TEMPLATE = "invite-link"

	redisClient, err := u.redisClient()
	if err != nil {
		log.RedisDownError(err)
		return nil, shared_errors.ErrSomethingWentWrong
	}

	var tokens []content
	var sendData []*mailerPB.Email
	for _, usr := range data {
		firstName := ""
		lastName := ""
		if usr.FirstName != nil {
			firstName = *usr.FirstName
		}
		if usr.LastName != nil {
			lastName = *usr.LastName
		}
		user := models.User{
			FirstName: firstName,
			LastName:  lastName,
			Email:     usr.Email,
			ShortName: usr.Email + "_" + strconv.FormatInt(time.Now().UnixNano(), 10),
			Status:    models.UserInvited,
		}

		createdUser, err := u.usersRepo.InviteUser(ctx, user, usr.Permissions)
		if err != nil {
			return nil, err
		}

		token := password.RandomHash()
		key := fmt.Sprintf("%s:%s:%s", tenantID, model.APP_SERVICE_NAME, token)
		err = redisClient.Set(key, createdUser.ID, 24*time.Hour).Err() // Omit error (Admin can resend link)
		if err != nil {
			log.RedisDownError(err)
		}

		t := content{token, usr.Email}
		tokens = append(tokens, t)
		j, _ := json.Marshal(t)

		emailStruct := &mailerPB.Email{
			To:            usr.Email,
			Subject:       "You has been invited to our system",
			Template:      TEMPLATE,
			CustomContent: string(j),
		}

		sendData = append(sendData, emailStruct)
	}

	go func() {
		mailerClient, err := u.mailerClient()
		if err != nil {
			log.MailerDownError(err)
			return
		}

		res, err := mailerClient.Send(context.Background(), &mailerPB.SendRequest{
			Email: sendData,
		})

		if err != nil {
			log.MailerDownError(err)
			return
		}

		if res == nil {
			log.MailerDownError(err)
			return
		}

		if !res.Success {
			log.WithError(res.Error).WithField("data", data)
		}
	}()

	tempTokens, _ := json.Marshal(tokens)
	tempTokensStr := string(tempTokens)
	return &tempTokensStr, nil
}

func (u *UsersImpl) CreateOwner(ctx context.Context, data models.OwnerCreateRequest) (*models.User, error) {
	ctx = context.WithValue(ctx, "tenant", data.TenantID) // TODO: rewrite in prior to shared_middleware.updateContextTenantModel
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateOwner")

	hashed := passMaker.HashPassword(data.Password)

	members, err := u.usersRepo.GetAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	if len(members) != 0 {
		return nil, shared_errors.ErrForbidden
	}

	user := models.User{
		Email:     data.Email,
		FirstName: data.FirstName,
		LastName:  data.LastName,
		Password:  hashed.CipherText,
		Salt:      hashed.Salt,
		ShortName: "admin",
		Status:    models.UserActive,
	}

	permissions, err := u.usersRepo.GetAllPermissions(ctx)
	if err != nil {
		return nil, err
	}

	var p []shared_middleware.PermissionList
	for _, perm := range permissions {
		p = append(p, shared_middleware.PermissionList{
			ID: perm.ID,
		})
	}

	createdUser, err := u.usersRepo.InviteUser(ctx, user, p)
	if err != nil {
		return nil, err
	}

	go func() {
		mailerClient, err := u.mailerClient()
		if err != nil {
			log.MailerDownError(err)
			return
		}

		const TEMPLATE = "create-owner"
		j, _ := json.Marshal(struct {
			Email string `json:"email"`
		}{
			Email: createdUser.Email,
		})

		emailStruct := &mailerPB.Email{
			To:            createdUser.Email,
			Subject:       "System is up, you can simply login with your email",
			Template:      TEMPLATE,
			CustomContent: string(j),
		}

		var sendData []*mailerPB.Email
		sendData = append(sendData, emailStruct)

		res, err := mailerClient.Send(context.Background(), &mailerPB.SendRequest{
			Email: sendData,
		})

		if err != nil {
			log.MailerDownError(err)
			return
		}

		if res == nil {
			log.MailerDownError(err)
			return
		}

		if !res.Success {
			log.MailerDownError(errors.New(res.Error.Message))
		}
	}()

	return createdUser, nil
}

func (u *UsersImpl) CheckUserMetaExists(ctx context.Context, data models.CheckUserMetaExistsRequest) (*bool, error) {
	return u.usersRepo.CheckUserMetaExists(ctx, data)
}

func (u *UsersImpl) GetMyPermissions(ctx context.Context, id uint32) ([]shared_middleware.PermissionList, error) {
	return u.usersRepo.GetMyPermissions(ctx, id)
}

func (u *UsersImpl) SaveToken(ctx context.Context, userID uint32, hash, token string, exp int64) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("SaveToken")

	userIdString := strconv.FormatUint(uint64(userID), 10)

	authClient, err := u.authClient()
	if err != nil {
		log.AuthDownError(err)
		return shared_errors.ErrAuthDown
	}

	res, err := authClient.WriteToRedis(context.Background(), &authPB.WriteToRedisRequest{
		TenantID: tenantID,
		Key:      fmt.Sprintf("tokens:%s:%s", tenantID, hash),
		Value:    userIdString + ":::" + token,
		Ex:       exp * int64(time.Hour),
	})

	if err != nil {
		log.WithError(err).WithField("hash", hash).Error("Cant send hash to auth_service")
		return shared_errors.ErrAuthDown
	}

	if !res.Success {
		log.WithError(err).WithField("hash", hash).Error("Cant send hash to auth_service (response: failed)")
		return shared_errors.ErrSomethingWentWrong
	}

	return nil
}

func (u *UsersImpl) GetTokenInfo(ctx context.Context, token string) (string, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetTokenInfo")

	authClient, err := u.authClient()
	if err != nil {
		log.AuthDownError(err)
		return "", shared_errors.ErrAuthDown
	}

	res, err := authClient.ReadFromRedis(context.Background(), &authPB.ReadFromRedisRequest{
		TenantID: tenantID,
		Key:      fmt.Sprintf("tokens:%s:%s", tenantID, token),
	})

	if err != nil {
		log.AuthDownError(err)
		return "", shared_errors.ErrAuthDown
	}

	if !res.Success {
		log.Logger.WithField("token", token).Error("Cant get token from auth_service (response: failed)")
		return "", shared_errors.ErrSomethingWentWrong
	}

	return res.Value, nil
}

func (u *UsersImpl) MultipleUsersEdit(ctx context.Context, data []models.EditUser) error {
	for _, usr := range data { // TODO: use channels?
		_, err := u.usersRepo.PatchUser(ctx, usr, usr.ID)
		if err != nil {
			return err
		}

		_ = u.setNeedReLogin(ctx, usr.ID)
	}

	return nil
}

func (u *UsersImpl) MultiplePermissionsEdit(ctx context.Context, data []models.EditUser, correlateWithIssuer bool) error {
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	allPerms, err := u.usersRepo.GetAllPermissions(ctx)
	if err != nil {
		return err
	}

	for _, usr := range data {
		approvedPerms := make([]shared_middleware.PermissionList, 0)

		if correlateWithIssuer {
			targetUser, err := u.GetUser(ctx, usr.ID)
			if err != nil {
				continue
			}

			actualTargetPerms := targetUser.PermissionList

			for _, targetPerm := range usr.Permissions {
				targetPerm.Models = uint32Unique(targetPerm.Models)

				for _, storedPerm := range allPerms {
					if targetPerm.ID == storedPerm.ID {
						targetPerm.Name = storedPerm.Name
						targetPerm.Essence = storedPerm.Essence
					}
				}

				targetRulePart := strings.Split(targetPerm.Name, "Can")

				for _, issuerPerm := range perms {
					issuerRulePart := strings.Split(issuerPerm.Name, "Can")

					if len(issuerRulePart) == 2 && targetRulePart[1] == issuerRulePart[1] {
						var actualTargetPerm *shared_middleware.PermissionList = nil
						for _, p := range actualTargetPerms {
							if p.Name == targetPerm.Name {
								actualTargetPerm = &p
								break
							}
						}

						newModels := make([]uint32, 0)
						issuerCheckingRule := "Can" + issuerRulePart[1]
						issuerPermModelsChecking := make([]uint32, 0)

						for _, issuerPermChecking := range perms {
							if issuerCheckingRule == issuerPermChecking.Name {
								issuerPermModelsChecking = issuerPermChecking.Models
							}

							if issuerPermChecking.Name == strings.Replace(issuerCheckingRule, "Some", "All", 1) {
								newModels = targetPerm.Models
							}
						}

						if actualTargetPerm != nil {
							essenceType := strings.Split(actualTargetPerm.Essence, ":")[0]

							if essenceType == "multiple" || essenceType == "grant" {
								if actualTargetPerm.Models != nil && len(actualTargetPerm.Models) != 0 { // TODO: May be models nil?
									if len(newModels) == 0 {
										for _, issuerPermModel := range issuerPermModelsChecking {
											for _, actualTargetPermModel := range actualTargetPerm.Models {
												if issuerPermModel == actualTargetPermModel {
													hasModelInTarget := false
													for _, targetPermModel := range targetPerm.Models {
														if targetPermModel == actualTargetPermModel {
															hasModelInTarget = true
															break
														}
													}

													if hasModelInTarget {
														newModels = append(newModels, actualTargetPermModel)
													}
													continue
												} else {
													newModels = append(newModels, actualTargetPermModel)

													for _, targetPermModel := range targetPerm.Models {
														if issuerPermModel == targetPermModel {
															if targetPermModel != actualTargetPermModel {
																newModels = append(newModels, targetPermModel)
																break
															}
														}
													}
												}
											}
										}
									}

									targetPerm.Models = uint32Unique(newModels)

									if len(targetPerm.Models) != 0 {
										approvedPerms = append(approvedPerms, targetPerm)
									}
								}
							} else if essenceType == "single" {
								approvedPerms = append(approvedPerms, targetPerm)
							}
						} else {
							essenceType := strings.Split(targetPerm.Essence, ":")[0]

							if essenceType == "multiple" || essenceType == "grant" {
								if essenceType == "grant" && len(targetPerm.Models) == 0 {
									approvedPerms = append(approvedPerms, targetPerm)
									break
								}

								for _, targetPermModel := range targetPerm.Models {
									for _, issuerPermModel := range issuerPermModelsChecking {
										if issuerPermModel == targetPermModel {
											newModels = append(newModels, targetPermModel)
										}
									}
								}

								targetPerm.Models = newModels

								if len(targetPerm.Models) != 0 {
									approvedPerms = append(approvedPerms, targetPerm)
								}
							} else if essenceType == "single" {
								approvedPerms = append(approvedPerms, targetPerm)
							}
						}
					}
				}
			}
		} else {
			for _, p := range allPerms {
				for index, targetPerm := range usr.Permissions {
					if targetPerm.ID == p.ID {
						usr.Permissions[index].Name = p.Name
						usr.Permissions[index].Essence = p.Essence
					}
				}
			}

			approvedPerms = usr.Permissions
		}

		err := u.usersRepo.EditPermissions(ctx, usr.ID, approvedPerms, correlateWithIssuer)
		if err != nil {
			return err
		}

		_ = u.setNeedReLogin(ctx, usr.ID)
	}

	return nil
}

func (u *UsersImpl) setNeedReLogin(ctx context.Context, userID uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("setNeedReLogin")

	userIdString := strconv.FormatUint(uint64(userID), 10)

	authClient, err := u.authClient()
	if err != nil {
		log.AuthDownError(err)
		return shared_errors.ErrAuthDown
	}

	res, err := authClient.WriteToRedis(context.Background(), &authPB.WriteToRedisRequest{
		TenantID: tenantID,
		Key:      fmt.Sprintf("needReLogin:%s:%s", tenantID, userIdString),
		Value:    userIdString,
	})

	if err != nil {
		log.WithError(err).Error("Cant set need reLogin in auth_service")
		return shared_errors.ErrAuthDown
	}

	if !res.Success {
		log.Logger.Error("Cant set need reLogin in auth_service (response: failed)")
		return shared_errors.ErrSomethingWentWrong
	}

	return nil
}

func (u *UsersImpl) MultipleUsersDelete(ctx context.Context, users []uint32) error {
	err := u.usersRepo.MultipleUsersDelete(ctx, users)
	if err != nil {
		return err
	}

	return nil
}

func (u *UsersImpl) MultipleUsersToggleBlock(ctx context.Context, users []uint32, blockStatus bool) error {
	err := u.usersRepo.MultipleUsersToggleBlock(ctx, users, blockStatus)
	if err != nil {
		return err
	}

	return nil
}

func (u *UsersImpl) WsEcho(ctx context.Context, IDs []uint32, event, payload string) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("WsEcho")

	signalClient, err := u.signalClient()
	if err != nil {
		log.AuthDownError(err)
		return shared_errors.ErrAuthDown
	}

	res, err := signalClient.FireEvent(context.Background(), &signalPB.FireEventRequest{
		TenantID: tenantID,
		IDs:      IDs,
		Event:    event,
		Payload:  payload,
	})

	if err != nil {
		log.WithError(err).Error("Cant set fire event in signal_service")
		return errors.NewWithDetails("Signal down", "-1")
	}

	if !res.Success {
		log.WithError(err).Error("Cant set fire event in signal_service (response: failed)")
		return shared_errors.ErrSomethingWentWrong
	}
	return nil
}

func (u *UsersImpl) GetCompanyInfo(ctx context.Context) (*models.CompanyData, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetCompanyInfo")

	tenantsClient, err := u.tenantsClient()
	if err != nil {
		log.TenantsDownError(err)
		return nil, shared_errors.ErrAuthDown
	}

	res, err := tenantsClient.GetCompanyInfo(context.Background(), &tenantsPB.GetCompanyInfoRequest{
		TenantID: tenantID,
	})

	if err != nil {
		log.TenantsDownError(err)
		return nil, shared_errors.ErrTenantsDown
	}

	if res == nil {
		log.TenantsDownError(err)
		return nil, shared_errors.ErrSomethingWentWrong
	}

	return &models.CompanyData{Name: res.Name}, nil
}

func (u *UsersImpl) CheckAccess(ctx context.Context, permName string, userID uint32, modelIDs []uint32) models.CheckAccessResponse {
	response, _ := u.usersRepo.CheckAccess(ctx, permName, userID, modelIDs)
	return response
}

func (u *UsersImpl) CheckAccessCtx(ctx context.Context, permName string, args ...interface{}) models.CheckAccessResponse {
	id, _ := shared_middleware.ParseContextUserModel(ctx)

	var modelIDs = make([]uint32, 0)
	if len(args) > 0 {
		modelIDs = args[0].([]uint32)
	}

	response, _ := u.usersRepo.CheckAccess(ctx, permName, id, modelIDs)
	return response
}

func (u *UsersImpl) CheckAccessSingleCtx(ctx context.Context, permName string) bool {
	response := u.CheckAccessCtx(ctx, permName)
	for _, p := range response.Access {
		if p.ModelID == 0 && p.HasAccess {
			return true
		}
	}

	return false
}

func uint32Unique(input []uint32) []uint32 {
	u := make([]uint32, 0, len(input))
	m := make(map[uint32]bool)

	for _, val := range input {
		if _, ok := m[val]; !ok {
			m[val] = true
			u = append(u, val)
		}
	}

	return u
}
