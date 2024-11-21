package http

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/go-chi/chi"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func RegisterHTTPEndpoints(r *chi.Mux, options []kithttp.ServerOption, casesImpl cases.Implementation, log *logrus.Entry) http.Handler {
	endpoints := MakeEndpoints(casesImpl)

	var (
		errorLogger  = kithttp.ServerErrorHandler(logger.UseLogger(log))
		errorEncoder = kithttp.ServerErrorEncoder(encodeErrorResponse)
	)

	options = append(options, errorLogger, errorEncoder)

	r.With(shared_middleware.AuthMiddleware).Route("/cases-api", func(r chi.Router) {
		r.Route("/cases/{projectID}/{spaceID}", func(r chi.Router) {
			r.Post("/", kithttp.NewServer(
				endpoints.CreateCase,
				decodeCreateCaseRequest,
				encodeResponse(encodeCreateCaseResponse),
				options...,
			).ServeHTTP)

			r.Get("/", kithttp.NewServer(
				endpoints.GetCases,
				decodeGetCasesRequest,
				encodeResponse(encodeGetCasesResponse),
				options...,
			).ServeHTTP)

			r.Get("/{caseId}", kithttp.NewServer(
				endpoints.GetCase,
				decodeGetCaseRequest,
				encodeResponse(encodeGetCaseResponse),
				options...,
			).ServeHTTP)

			r.Patch("/{caseId}", kithttp.NewServer(
				endpoints.EditCase,
				decodeEditCaseRequest,
				encodeResponse(encodeEditCaseResponse),
				options...,
			).ServeHTTP)

			r.Delete("/{caseId}", kithttp.NewServer(
				endpoints.DeleteCase,
				decodeDeleteCaseRequest,
				encodeResponse(encodeDeleteCaseResponse),
				options...,
			).ServeHTTP)
		})

		r.Route("/step-groups/{caseID}", func(r chi.Router) {
			r.Post("/", kithttp.NewServer(
				endpoints.CreateStepGroup,
				decodeCreateStepGroupRequest,
				encodeResponse(encodeCreateStepGroupResponse),
				options...,
			).ServeHTTP)

			r.Get("/", kithttp.NewServer(
				endpoints.GetStepGroups,
				decodeGetStepGroupsRequest,
				encodeResponse(encodeGetStepGroupsResponse),
				options...,
			).ServeHTTP)

			r.Get("/{stepGroupID}", kithttp.NewServer(
				endpoints.GetStepGroup,
				decodeGetStepGroupRequest,
				encodeResponse(encodeGetStepGroupResponse),
				options...,
			).ServeHTTP)

			r.Patch("/{stepGroupID}", kithttp.NewServer(
				endpoints.EditStepGroup,
				decodeEditStepGroupRequest,
				encodeResponse(encodeEditStepGroupResponse),
				options...,
			).ServeHTTP)

			r.Delete("/{stepGroupID}", kithttp.NewServer(
				endpoints.DeleteStepGroup,
				decodeDeleteStepGroupRequest,
				encodeResponse(encodeDeleteStepGroupResponse),
				options...,
			).ServeHTTP)
		})

		r.Route("/steps/{caseID}", func(r chi.Router) {
			r.Post("/{stepGroupID}", kithttp.NewServer(
				endpoints.CreateStep,
				decodeCreateStepRequest,
				encodeResponse(encodeCreateStepResponse),
				options...,
			).ServeHTTP)

			r.Get("/{stepGroupID}", kithttp.NewServer(
				endpoints.GetSteps,
				decodeGetStepsRequest,
				encodeResponse(encodeGetStepsResponse),
				options...,
			).ServeHTTP)

			r.Get("/{stepGroupID}/{stepID}", kithttp.NewServer(
				endpoints.GetStep,
				decodeGetStepRequest,
				encodeResponse(encodeGetStepResponse),
				options...,
			).ServeHTTP)

			r.Patch("/{stepGroupID}/{stepID}", kithttp.NewServer(
				endpoints.EditStep,
				decodeEditStepRequest,
				encodeResponse(encodeEditStepResponse),
				options...,
			).ServeHTTP)

			r.Delete("/{stepGroupID}/{stepID}", kithttp.NewServer(
				endpoints.DeleteStep,
				decodeDeleteStepRequest,
				encodeResponse(encodeDeleteStepResponse),
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
