package http

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/landing-service/landing"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/go-chi/chi"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func RegisterHTTPEndpoints(r *chi.Mux, options []kithttp.ServerOption, usersImpl landing.Implementation, log *logrus.Entry) http.Handler {
	endpoints := MakeEndpoints(usersImpl)

	var (
		errorLogger  = kithttp.ServerErrorHandler(logger.UseLogger(log))
		errorEncoder = kithttp.ServerErrorEncoder(encodeErrorResponse)
	)

	options = append(options, errorLogger, errorEncoder)

	r.Route("/landing-api", func(r chi.Router) {
		r.Post("/company", kithttp.NewServer(
			endpoints.CreateCompany,
			decodeCreateCompanyRequest,
			encodeResponse(encodeCreateCompanyResponse),
			options...,
		).ServeHTTP)
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
