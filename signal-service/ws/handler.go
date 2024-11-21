package ws

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"context"
	"encoding/json"
	"github.com/go-chi/chi"
	kithttp "github.com/go-kit/kit/transport/http"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func tenantMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), "tenant", "")
		tenant := strings.Split(r.Header.Get("x-forwarded-host"), ".")[:1][0]

		ctx = context.WithValue(r.Context(), "tenant", tenant)

		next.ServeHTTP(w, r.WithContext(ctx))
		return
	})
}

func RegisterHTTPEndpoints(r *chi.Mux, options []kithttp.ServerOption, hub *Hub, log *logrus.Entry) http.Handler {
	var (
		errorLogger  = kithttp.ServerErrorHandler(logger.UseLogger(log))
		errorEncoder = kithttp.ServerErrorEncoder(encodeErrorResponse)
	)

	options = append(options, errorLogger, errorEncoder)

	makeHandler := func() http.HandlerFunc {
		return serveWs(hub)
	}

	r.Route("/signal-api", func(r chi.Router) {
		r.With(tenantMiddleware).Mount("/", makeHandler())
	})

	return r
}

func encodeErrorResponse(_ context.Context, err error, w http.ResponseWriter) {
	if err == nil {
		err = shared_errors.ErrSomethingWentWrong
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(400)

	encoder := json.NewEncoder(w)
	err = encoder.Encode(err.Error())
	if err != nil {
		_ = encoder.Encode(shared_errors.ErrSomethingWentWrong)
	}
}
