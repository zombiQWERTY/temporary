package http

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/users-service/users"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/go-chi/chi"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func RegisterHTTPEndpoints(r *chi.Mux, options []kithttp.ServerOption, usersImpl users.Implementation, log *logrus.Entry) http.Handler {
	endpoints := MakeEndpoints(usersImpl, logger.UseLogger(log))

	var (
		errorLogger  = kithttp.ServerErrorHandler(logger.UseLogger(log))
		errorEncoder = kithttp.ServerErrorEncoder(encodeErrorResponse)
	)

	options = append(options, errorLogger, errorEncoder)

	r.Route("/users-api", func(r chi.Router) {
		r.With(shared_middleware.AuthMiddleware).Get("/ws-echo", kithttp.NewServer(
			endpoints.WsEcho,
			decodeWsEchoRequest,
			encodeResponse(encodeWsEchoResponse),
			options...,
		).ServeHTTP)

		r.With(shared_middleware.AuthMiddleware).Post("/check-email", kithttp.NewServer(
			endpoints.CheckUserMetaExists,
			decodeCheckUserMetaExistsRequest,
			encodeResponse(encodeCheckUserMetaExistsResponse),
			options...,
		).ServeHTTP)

		r.Post("/check-short-name", kithttp.NewServer(
			endpoints.CheckUserMetaExists,
			decodeCheckUserMetaExistsRequest,
			encodeResponse(encodeCheckUserMetaExistsResponse),
			options...,
		).ServeHTTP)

		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", kithttp.NewServer(
				endpoints.Register,
				decodeRegisterRequest,
				encodeResponse(encodeRegisterResponse),
				options...,
			).ServeHTTP)

			r.Post("/login", kithttp.NewServer(
				endpoints.Login,
				decodeLoginRequest,
				encodeResponse(encodeLoginResponse),
				options...,
			).ServeHTTP)

			r.Post("/refresh-token", kithttp.NewServer(
				endpoints.RefreshToken,
				decodeRefreshTokenRequest,
				encodeResponse(encodeRefreshTokenResponse),
				options...,
			).ServeHTTP)

			r.Get("/invited-info/{token}", kithttp.NewServer(
				endpoints.GetInvitedInfo,
				decodeGetInvitedInfoRequest,
				encodeResponse(encodeGetInvitedInfoResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Delete("/logout/{refreshToken}", kithttp.NewServer(
				endpoints.Logout,
				decodeLogoutRequest,
				encodeResponse(encodeLogoutResponse),
				options...,
			).ServeHTTP)
		})

		r.Route("/users", func(r chi.Router) {
			r.With(shared_middleware.AuthMiddleware).Get("/me", kithttp.NewServer(
				endpoints.GetUser,
				decodeGetUserRequest,
				encodeResponse(encodeGetUserResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Get("/{userID}", kithttp.NewServer(
				endpoints.GetUserByID,
				decodeGetUserByIDRequest,
				encodeResponse(encodeGetUserResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Patch("/me", kithttp.NewServer(
				endpoints.PatchUser,
				decodePatchUserRequest,
				encodeResponse(encodePatchUserResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Get("/", kithttp.NewServer(
				endpoints.GetAllUsers,
				decodeGetAllUsersRequest,
				encodeResponse(encodeGetAllUsersResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Post("/invite", kithttp.NewServer(
				endpoints.InviteUser,
				decodeInviteUserRequest,
				encodeResponse(encodeInviteUserResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Patch("/", kithttp.NewServer(
				endpoints.MultipleUsersEdit,
				decodeMultipleUsersEditRequest,
				encodeResponse(encodeMultipleUsersEditResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Patch("/delete", kithttp.NewServer(
				endpoints.MultipleUsersDelete,
				decodeMultipleUsersDeleteRequest,
				encodeResponse(encodeMultipleUsersDeleteResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Post("/block", kithttp.NewServer(
				endpoints.MultipleUsersBlock,
				decodeMultipleUsersToggleBlockRequest,
				encodeResponse(encodeMultipleUsersToggleBlockResponse),
				options...,
			).ServeHTTP)

			r.With(shared_middleware.AuthMiddleware).Post("/unblock", kithttp.NewServer(
				endpoints.MultipleUsersUnBlock,
				decodeMultipleUsersToggleBlockRequest,
				encodeResponse(encodeMultipleUsersToggleBlockResponse),
				options...,
			).ServeHTTP)
		})
	})

	return r
}

func encodeResponse(fn func(w http.ResponseWriter, response interface{}) error) func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	return func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
		if e, ok := response.(error); ok && e.Error() != "" {
			encodeErrorResponse(ctx, e, w)
			return nil
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		return fn(w, response)
	}
}

func encodeErrorResponse(_ context.Context, err error, w http.ResponseWriter) {
	if err == nil {
		err = shared_errors.ErrSomethingWentWrong
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(codeFrom(err))

	encoder := json.NewEncoder(w)
	err = encoder.Encode(makeError(err))
	if err != nil {
		_ = encoder.Encode(makeError(shared_errors.ErrSomethingWentWrong))
	}
}

func codeFrom(err error) int {
	if len(errors.GetDetails(err)) > 3 {
		if errors.GetDetails(err)[2] == 401 {
			return http.StatusUnauthorized
		}

		if errors.GetDetails(err)[2] == 403 {
			return http.StatusForbidden
		}
	}

	return http.StatusBadRequest
}

func makeValidationObject(str string) map[string]string {
	pairs := strings.Split(str, ";")

	makeKey := func(str string) string {
		splited := strings.Split(str, ".")
		if len(splited) == 2 {
			return strings.ToLower(splited[1])
		}

		return strings.ToLower(splited[0])
	}

	var errorObject = make(map[string]string)
	for _, v := range pairs {
		internalPair := strings.Split(v, ": ")

		_, exists := errorObject[makeKey(internalPair[0])]
		if !exists {
			errorObject[makeKey(internalPair[0])] = internalPair[1]
		}
	}

	return errorObject
}

type ResponseHTTPErrorDetail struct {
	Code       string            `json:"code,omitempty"`
	Message    string            `json:"message,omitempty"`
	Validation map[string]string `json:"validation,omitempty"`
}

type ResponseHTTPError struct {
	Error ResponseHTTPErrorDetail `json:"error"`
}

func makeError(err error) ResponseHTTPError {
	err = errors.GetErrors(err)[0]

	if isValidationError(err) {
		code := errors.GetDetails(err)[0].(string)
		message := errors.Cause(err).Error()
		validationError := errors.GetErrors(err)[0].Error()

		return ResponseHTTPError{
			Error: ResponseHTTPErrorDetail{
				Code:       code,
				Message:    message,
				Validation: makeValidationObject(validationError),
			},
		}
	}

	return ResponseHTTPError{
		Error: ResponseHTTPErrorDetail{
			Code:    errors.GetDetails(err)[0].(string),
			Message: err.Error(),
		},
	}
}

func isValidationError(err error) bool {
	return errors.Cause(err) == errors.Cause(shared_errors.ErrValidationFailed)
}
