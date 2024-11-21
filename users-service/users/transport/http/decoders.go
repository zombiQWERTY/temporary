package http

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/asaskevich/govalidator"
	"github.com/go-chi/chi"
	"net/http"
	"strconv"
	"strings"
)

func decodeRegisterRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req RegisterRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeLoginRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req LoginRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeRefreshTokenRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req RefreshTokenRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeLogoutRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req LogoutRequest

	req.AccessToken = tokens_manager.TokenFromHeader(r)
	req.RefreshToken = chi.URLParam(r, "refreshToken")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeGetInvitedInfoRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetInvitedInfoRequest
	req.Token = chi.URLParam(r, "token")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeGetUserRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	return nil, nil
}

func decodeGetUserByIDRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetUserRequest
	u64, err := strconv.ParseUint(chi.URLParam(r, "userID"), 10, 32)
	if err != nil {
		return nil, err
	}

	req.UserID = uint32(u64)

	return req, nil
}

func decodeGetAllUsersRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetAllUsersRequest
	withPermsStr := r.URL.Query().Get("withPerms")
	if len(withPermsStr) == 0 {
		withPermsStr = "false"
	}

	withPerms, err := strconv.ParseBool(withPermsStr)
	if err == nil {
		req.WithPerms = withPerms
	} else {
		req.WithPerms = false
	}

	return req, nil
}

func decodePatchUserRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req PatchUserRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeInviteUserRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req InviteUserRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeCheckUserMetaExistsRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CheckUserMetaExistsRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeMultipleUsersEditRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req MultipleUsersEditRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeMultipleUsersDeleteRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req MultipleUsersDeleteRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeMultipleUsersToggleBlockRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req MultipleUsersToggleBlockRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}

func decodeWsEchoRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req WsEchoRequest
	IDsStr := r.URL.Query().Get("IDs")
	eventStr := r.URL.Query().Get("event")
	payloadStr := r.URL.Query().Get("payload")

	if len(IDsStr) == 0 {
		IDsStr = ""
	}

	if len(eventStr) == 0 {
		eventStr = ""
	}

	if len(payloadStr) == 0 {
		payloadStr = ""
	}

	IDsStrList := strings.Split(IDsStr, ",")
	IDs := make([]uint32, 0)
	for _, id := range IDsStrList {
		u64, _ := strconv.ParseUint(id, 10, 32)
		IDs = append(IDs, uint32(u64))
	}

	req.IDs = IDs
	req.Event = eventStr
	req.Payload = payloadStr

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}
