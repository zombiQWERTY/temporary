package http

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/asaskevich/govalidator"
	"net/http"
)

func decodeCreateCompanyRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateCompanyRequest

	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.Wrap(shared_errors.ErrValidationFailed, err.Error())
	}

	return req, nil
}
