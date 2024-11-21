package http

import (
	"bitbucket.org/ittinc/go-shared-packages/encoder"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"bitbucket.org/ittinc/users-service/model"
	"bitbucket.org/ittinc/users-service/models"
	"bitbucket.org/ittinc/users-service/users"
	"context"
	"crypto/rsa"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/go-kit/kit/endpoint"
	"strconv"
	"strings"
)

type Endpoints struct {
	Register             endpoint.Endpoint
	Login                endpoint.Endpoint
	RefreshToken         endpoint.Endpoint
	Logout               endpoint.Endpoint
	GetUser              endpoint.Endpoint
	GetUserByID          endpoint.Endpoint
	GetAllUsers          endpoint.Endpoint
	PatchUser            endpoint.Endpoint
	InviteUser           endpoint.Endpoint
	CheckUserMetaExists  endpoint.Endpoint
	MultipleUsersEdit    endpoint.Endpoint
	GetInvitedInfo       endpoint.Endpoint
	MultipleUsersDelete  endpoint.Endpoint
	MultipleUsersBlock   endpoint.Endpoint
	MultipleUsersUnBlock endpoint.Endpoint
	WsEcho               endpoint.Endpoint
}

func MakeEndpoints(s users.Implementation, log *logger.Logger) Endpoints {
	return Endpoints{
		Register:             makeRegisterEndpoint(s, log),
		Login:                makeLoginEndpoint(s, log),
		RefreshToken:         makeRefreshTokenEndpoint(s, log),
		Logout:               makeLogoutEndpoint(s, log),
		GetUser:              makeGetUserEndpoint(s, log),
		GetUserByID:          makeGetUserByIDEndpoint(s, log),
		GetAllUsers:          makeGetAllUsersEndpoint(s, log),
		PatchUser:            makePatchUserEndpoint(s, log),
		InviteUser:           makeInviteUserEndpoint(s, log),
		CheckUserMetaExists:  makeCheckUserMetaExistsEndpoint(s, log),
		MultipleUsersEdit:    makeMultipleUsersEditEndpoint(s, log),
		GetInvitedInfo:       makeGetInvitedInfoEndpoint(s, log),
		MultipleUsersDelete:  makeMultipleUsersDeleteEndpoint(s, log),
		MultipleUsersBlock:   makeMultipleUsersToggleBlockEndpoint(true)(s, log),
		MultipleUsersUnBlock: makeMultipleUsersToggleBlockEndpoint(false)(s, log),
		WsEcho:               makeWsEchoEndpoint(s, log),
	}
}

func makeRegisterEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		tenantID := shared_middleware.ParseContextTenantModel(ctx)
		log := logger.WithReqID(ctx).TenantID(tenantID).Method("makeRegisterEndpoint")

		body := request.(RegisterRequest)
		user, err := s.Register(ctx, body.UserCreateRequest)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrCantRegister
		}

		tokenPair, err := manageTokenPair(s, ctx, user, log, nil)
		if err != nil {
			return nil, err
		}

		response := RegisterResponse{
			User:   *user,
			Tokens: *tokenPair,
		}

		res, err := s.GetCompanyInfo(ctx)
		if err != nil || res == nil {
			log.WithError(err).Error("Cant get company info data")
			response.Company.Name = ""
		} else {
			response.Company.Name = res.Name
		}

		return response, nil
	}
}

func makeGetInvitedInfoEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		tenantID := shared_middleware.ParseContextTenantModel(ctx)
		log := logger.WithReqID(ctx).TenantID(tenantID).Method("makeGetInvitedInfoEndpoint")

		body := request.(GetInvitedInfoRequest)
		user, err := s.GetInvitedInfo(ctx, body.Token)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrSomethingWentWrong
		}

		response := GetInvitedInfoResponse{
			User: *user,
		}

		res, err := s.GetCompanyInfo(ctx)
		if err != nil || res == nil {
			log.WithError(err).Error("Cant get company info data")
			response.Company.Name = ""
		} else {
			response.Company.Name = res.Name
		}

		return response, nil
	}
}

func makeLoginEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		tenantID := shared_middleware.ParseContextTenantModel(ctx)
		log := logger.WithReqID(ctx).TenantID(tenantID).Method("makeLoginEndpoint")

		body := request.(LoginRequest)
		user, err := s.Login(ctx, body.UserLoginRequest)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrUserNotFound
		}

		tokenPair, err := manageTokenPair(s, ctx, user, log, nil)
		if err != nil {
			return nil, err
		}

		response := LoginResponse{
			Tokens: *tokenPair,
			User:   *user,
		}

		res, err := s.GetCompanyInfo(ctx)
		if err != nil || res == nil {
			log.WithError(err).Error("Cant get company info data")
			response.Company.Name = ""
		} else {
			response.Company.Name = res.Name
		}

		return response, nil
	}
}

func manageRefreshToken(s users.Implementation, ctx context.Context, token string, id *uint32) (*tokens_manager.JwtClaims, *rsa.PrivateKey, error) {
	refreshTokenData, err := s.GetTokenInfo(ctx, token)
	if err != nil {
		return nil, nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	refreshTokenDataParsed := strings.Split(refreshTokenData, ":::")
	if len(refreshTokenDataParsed) == 0 {
		return nil, nil, shared_errors.ErrTokenInvalid
	}

	userID := refreshTokenDataParsed[0]
	refreshToken := refreshTokenDataParsed[1]

	userId64, _ := strconv.ParseUint(userID, 10, 32)
	userID32 := uint32(userId64)

	if id != nil && *id != userID32 {
		return nil, nil, shared_errors.ErrTokenInvalid
	}

	privateKey, err := s.GetPrivateKey(ctx, userID32)
	if err != nil {
		return nil, nil, err
	}

	decryptedPayload, err := tokens_manager.Decrypt(privateKey, refreshToken)
	if err != nil {
		return nil, nil, errors.Append(shared_errors.ErrTokenInvalid, err)
	}

	tokenValid := tokens_manager.Validate(decryptedPayload)

	if !tokenValid {
		return nil, nil, shared_errors.ErrTokenExpired
	}

	return decryptedPayload, privateKey, nil
}

func manageTokenPair(s users.Implementation, ctx context.Context, user *models.User, log *logger.Logger, privateKey *rsa.PrivateKey) (*tokens_manager.TokenPair, error) {
	j, err := json.Marshal(user.PermissionList)
	if err != nil {
		log.WithError(err).Error("Cant Marshal PermissionList")
		return nil, err
	}

	payload := tokens_manager.JwtPayload{
		ID:         user.ID,
		Permission: string(j),
	}

	if privateKey == nil {
		privateKey, err = s.GetPrivateKey(ctx, user.ID)
		if err != nil {
			return nil, err
		}
	}

	tokenPair, err := tokens_manager.MakeTokenPair(privateKey, payload, model.ACCESS_TOKEN_EXPIRES, model.REFRESH_TOKEN_EXPIRES)
	if err != nil {
		return nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	stringEncoder, _ := encoder.NewAESEncoder("base64:qHid5j5ibQ3EHjoMCACAmw2q2tyr+EGwXkq1wbajC1o=")
	encodedAccessToken, err := stringEncoder.EncodeString([]byte(tokenPair.AccessToken))
	if err != nil {
		return nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	encodedRefreshToken, err := stringEncoder.EncodeString([]byte(tokenPair.RefreshToken))
	if err != nil {
		return nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	encodedAccessToken = encoder.ToSha256(encodedAccessToken)
	encodedRefreshToken = encoder.ToSha256(encodedRefreshToken)

	err = s.SaveToken(ctx, user.ID, encodedAccessToken, tokenPair.AccessToken, int64(model.ACCESS_TOKEN_EXPIRES))
	if err != nil {
		return nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	err = s.SaveToken(ctx, user.ID, encodedRefreshToken, tokenPair.RefreshToken, int64(model.REFRESH_TOKEN_EXPIRES))
	if err != nil {
		return nil, errors.Append(shared_errors.ErrMakeTokens, err)
	}

	tokenPair.AccessToken = encodedAccessToken
	tokenPair.RefreshToken = encodedRefreshToken

	return &tokenPair, nil
}

func makeRefreshTokenEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		tenantID := shared_middleware.ParseContextTenantModel(ctx)
		log := logger.WithReqID(ctx).TenantID(tenantID).Method("makeRefreshTokenEndpoint")

		body := request.(RefreshTokenRequest)

		decryptedPayload, privateKey, err := manageRefreshToken(s, ctx, body.RefreshTokenRequest.RefreshToken, nil)
		if err != nil {
			return nil, err
		}

		user, err := s.RefreshToken(ctx, body.RefreshTokenRequest, decryptedPayload.JwtPayload.ID)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrUserNotFound
		}

		tokenPair, err := manageTokenPair(s, ctx, user, log, privateKey)
		if err != nil {
			return nil, err
		}

		response := RefreshTokenResponse{
			User:   *user,
			Tokens: *tokenPair,
		}

		res, err := s.GetCompanyInfo(ctx)
		if err != nil || res == nil {
			log.WithError(err).Error("Cant get company info data")
			response.Company.Name = ""
		} else {
			response.Company.Name = res.Name
		}

		return response, nil
	}
}

func makeLogoutEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		id, _ := shared_middleware.ParseContextUserModel(ctx)

		body := request.(LogoutRequest)

		_, _, err := manageRefreshToken(s, ctx, body.RefreshToken, &id)
		if err != nil {
			return LogoutResponse{Success: true}, nil
		}

		_ = s.Logout(ctx, body.LogoutRequest)
		return LogoutResponse{Success: true}, nil
	}
}

func makeGetUserEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		id, _ := shared_middleware.ParseContextUserModel(ctx)
		tenantID := shared_middleware.ParseContextTenantModel(ctx)
		log := logger.WithReqID(ctx).TenantID(tenantID).Method("makeGetUserEndpoint")

		user, err := s.GetUser(ctx, id)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrUserNotFound
		}

		response := GetUserResponse{User: *user}

		res, err := s.GetCompanyInfo(ctx)
		if err != nil || res == nil {
			log.WithError(err).Error("Cant get company info data")
			response.Company.Name = ""
		} else {
			response.Company.Name = res.Name
		}

		return response, nil
	}
}

func makeGetUserByIDEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		if !policy_manager.Check(ctx, "users", "CanEditAllUsers") {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		body := request.(GetUserRequest)

		user, err := s.GetUser(ctx, body.UserID)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrUserNotFound
		}

		return GetUserResponse{User: *user}, nil
	}
}

func makeGetAllUsersEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetAllUsersRequest)

		if !policy_manager.Check(ctx, "users", "CanReadAllUsers") && body.WithPerms {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		userList, err := s.GetAllUsers(ctx, body.WithPerms)
		if err != nil {
			return nil, err
		}

		return GetAllUsersResponse{Users: userList}, nil
	}
}

func makePatchUserEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		id, _ := shared_middleware.ParseContextUserModel(ctx)
		body := request.(PatchUserRequest)

		user, err := s.PatchUser(ctx, body.PatchUserRequest, id)
		if err != nil {
			return nil, err
		}

		if user == nil {
			return nil, shared_errors.ErrUserNotFound
		}

		return PatchUserResponse{
			User: *user,
		}, nil
	}
}

func makeInviteUserEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		if !policy_manager.Check(ctx, "users", "CanInviteUsers") {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		body := request.(InviteUserRequest)
		tempTokens, err := s.InviteUser(ctx, body.Users)
		if err != nil {
			return nil, err
		}

		return InviteUserResponse{
			Success:    true,
			TempTokens: tempTokens,
		}, nil
	}
}

func makeCheckUserMetaExistsEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		id, _ := shared_middleware.ParseContextUserModel(ctx)

		if id != 0 { // If id is not 0, then is "checkEmail" method
			if !policy_manager.Check(ctx, "users", "CanInviteUsers") || !policy_manager.Check(ctx, "users", "CanEditAllUsers") {
				return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
			}
		}

		body := request.(CheckUserMetaExistsRequest)

		if id == 0 {
			body.Email = ""
		}

		if len(body.ShortName) != 0 && len(body.Email) != 0 {
			return nil, errors.WithDetails(shared_errors.ErrOneProperty)
		}

		exists, err := s.CheckUserMetaExists(ctx, body.CheckUserMetaExistsRequest)
		if err != nil {
			return nil, err
		}

		return CheckUserMetaExistsResponse{
			Exists: *exists,
		}, nil
	}
}

func makeMultipleUsersEditEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		if !policy_manager.Check(ctx, "users", "CanEditAllUsers") {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		body := request.(MultipleUsersEditRequest)
		err := s.MultipleUsersEdit(ctx, body.Users)
		if err != nil {
			return nil, err
		}

		err = permissionsEdit(s, ctx, body, true)
		if err != nil {
			return nil, err
		}

		return MultipleUsersEditResponse{
			Success: true,
		}, nil
	}
}

func permissionsEdit(s users.Implementation, ctx context.Context, payload MultipleUsersEditRequest, correlateWithIssuer bool) error {
	if len(payload.Users) > 0 {
		err := s.MultiplePermissionsEdit(ctx, payload.Users, correlateWithIssuer)
		if err != nil {
			return err
		}
	}

	return nil
}

func makeMultipleUsersDeleteEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		if !policy_manager.Check(ctx, "users", "CanDeleteAllUsers") {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		body := request.(MultipleUsersDeleteRequest)

		id, _ := shared_middleware.ParseContextUserModel(ctx)
		if containsUint32(body.Users, id) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.MultipleUsersDelete(ctx, body.Users)
		if err != nil {
			return nil, err
		}

		return MultipleUsersDeleteResponse{
			Success: true,
		}, nil
	}
}

func containsUint32(s []uint32, e uint32) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func makeMultipleUsersToggleBlockEndpoint(blockStatus bool) func(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
		return func(ctx context.Context, request interface{}) (interface{}, error) {
			if !policy_manager.Check(ctx, "users", "CanDeleteAllUsers") {
				return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
			}

			body := request.(MultipleUsersToggleBlockRequest)

			id, _ := shared_middleware.ParseContextUserModel(ctx)
			if containsUint32(body.Users, id) {
				return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
			}

			err := s.MultipleUsersToggleBlock(ctx, body.Users, blockStatus)
			if err != nil {
				return nil, err
			}

			return MultipleUsersToggleBlockResponse{
				Success: true,
			}, nil
		}
	}
}

func makeWsEchoEndpoint(s users.Implementation, logger *logger.Logger) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(WsEchoRequest)
		err := s.WsEcho(ctx, body.IDs, body.Event, body.Payload)
		if err != nil {
			return nil, err
		}

		return WsEchoResponse{
			Success: true,
		}, nil
	}
}
