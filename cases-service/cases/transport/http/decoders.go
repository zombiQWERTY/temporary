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

func getMetaData(r *http.Request, key string) (uint32, error) {
	result, err := strconv.ParseUint(chi.URLParam(r, key), 10, 32)
	return uint32(result), err
}

func decodeCreateCaseRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateCaseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.ProjectID, _ = getMetaData(r, "projectID")
	req.SpaceID, _ = getMetaData(r, "spaceID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetCasesRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetCasesRequest

	req.ProjectID, _ = getMetaData(r, "projectID")
	req.SpaceID, _ = getMetaData(r, "spaceID")
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	folderStr := r.URL.Query().Get("folder")
	sortStr := r.URL.Query().Get("sort")

	if len(pageStr) == 0 {
		pageStr = "1"
	}

	if len(limitStr) == 0 {
		limitStr = "5"
	}

	if len(sortStr) == 0 {
		sortStr = ""
	}

	var folder *int32 = nil
	if len(folderStr) != 0 {
		folderI64, _ := strconv.ParseInt(folderStr, 10, 32)
		folderI32 := int32(folderI64)
		folder = &folderI32
	}

	pageU64, _ := strconv.ParseUint(pageStr, 10, 32)
	limitU64, _ := strconv.ParseUint(limitStr, 10, 32)

	req.Page = uint32(pageU64)
	req.Limit = uint32(limitU64)
	req.Folder = folder
	req.Sort = sortStr

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetCaseRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetCaseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.ProjectID, _ = getMetaData(r, "projectID")
	req.SpaceID, _ = getMetaData(r, "spaceID")
	req.CaseId, _ = getMetaData(r, "caseId")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeEditCaseRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req EditCaseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.ProjectID, _ = getMetaData(r, "projectID")
	req.SpaceID, _ = getMetaData(r, "spaceID")
	req.CaseId, _ = getMetaData(r, "caseId")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDeleteCaseRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DeleteCaseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.ProjectID, _ = getMetaData(r, "projectID")
	req.SpaceID, _ = getMetaData(r, "spaceID")
	req.CaseId, _ = getMetaData(r, "caseId")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeCreateStepGroupRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateStepGroupRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetStepGroupsRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetStepGroupsRequest

	req.CaseID, _ = getMetaData(r, "caseID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetStepGroupRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetStepGroupRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeEditStepGroupRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req EditStepGroupRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDeleteStepGroupRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DeleteStepGroupRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeCreateStepRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req CreateStepRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetStepsRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetStepsRequest

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeGetStepRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req GetStepRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepID, _ = getMetaData(r, "stepID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeEditStepRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req EditStepRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepGroupID, _ = getMetaData(r, "stepGroupID")
	req.StepID, _ = getMetaData(r, "stepID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}

func decodeDeleteStepRequest(_ context.Context, r *http.Request) (request interface{}, err error) {
	var req DeleteStepRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	req.CaseID, _ = getMetaData(r, "caseID")
	req.StepID, _ = getMetaData(r, "stepID")

	_, err = govalidator.ValidateStruct(req)
	if err != nil {
		return nil, errors.WithDetails(errors.Wrap(shared_errors.ErrValidationFailed, err.Error()))
	}

	return req, nil
}
