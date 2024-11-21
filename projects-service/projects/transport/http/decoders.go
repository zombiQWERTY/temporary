package http

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"context"
	"emperror.dev/errors"
	"encoding/json"
	"github.com/asaskevich/govalidator"
	"github.com/go-chi/chi"
	"net/http"
	"strconv"
)

func decodeCreateProjectRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateProjectRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetProjectsRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	return request, nil
}

func decodeGetProjectRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetProjectRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "projectId"), 10, 32)
	req.ProjectId = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeEditProjectRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req EditProjectRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "projectId"), 10, 32)
	req.ProjectId = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDeleteProjectRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DeleteProjectRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "projectId"), 10, 32)
	req.ProjectId = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeStarRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req StarRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	req.ID = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeCreateSpaceRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateSpaceRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeEditSpaceRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req EditSpaceRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "spaceId"), 10, 32)
	req.SpaceId = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDNDSpacesRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DNDSpacesRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDeleteSpaceRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DeleteSpaceRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	u64, err := strconv.ParseUint(chi.URLParam(r, "spaceId"), 10, 32)
	req.SpaceId = uint32(u64)

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}
