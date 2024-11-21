package http

import (
	"bitbucket.org/ittinc/auth-service/auth"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"context"
	"github.com/go-chi/chi"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"net/http"
)

func RegisterHTTPEndpoints(r *chi.Mux, options []kithttp.ServerOption, authImpl auth.Implementation, log *logrus.Entry) http.Handler {
	endpoints := MakeEndpoints(authImpl)

	var (
		errorLogger  = kithttp.ServerErrorHandler(logger.UseLogger(log))
		errorEncoder = kithttp.ServerErrorEncoder(encodeErrorResponse)
	)

	options = append(options, errorLogger, errorEncoder)

	r.Get("/auth", kithttp.NewServer(
		endpoints.DoAuth,
		decodeAuthRequest,
		encodeResponse(encodeAuthResponse),
		options...,
	).ServeHTTP)

	return r
}

func encodeResponse(fn func(w http.ResponseWriter, response interface{}) error) func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	return func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
		return fn(w, response)
	}
}

func encodeErrorResponse(_ context.Context, err error, w http.ResponseWriter) {}
