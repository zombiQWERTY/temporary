package http

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"bitbucket.org/ittinc/cases-service/models"
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"context"
	"emperror.dev/errors"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CreateCase endpoint.Endpoint
	GetCases   endpoint.Endpoint
	GetCase    endpoint.Endpoint
	EditCase   endpoint.Endpoint
	DeleteCase endpoint.Endpoint

	CreateStepGroup endpoint.Endpoint
	GetStepGroups   endpoint.Endpoint
	GetStepGroup    endpoint.Endpoint
	EditStepGroup   endpoint.Endpoint
	DeleteStepGroup endpoint.Endpoint

	CreateStep endpoint.Endpoint
	GetSteps   endpoint.Endpoint
	GetStep    endpoint.Endpoint
	EditStep   endpoint.Endpoint
	DeleteStep endpoint.Endpoint
}

func MakeEndpoints(s cases.Implementation) Endpoints {
	return Endpoints{
		CreateCase: makeCreateCaseEndpoint(s),
		GetCases:   makeGetCasesEndpoint(s),
		GetCase:    makeGetCaseEndpoint(s),
		EditCase:   makeEditCaseEndpoint(s),
		DeleteCase: makeDeleteCaseEndpoint(s),

		CreateStepGroup: makeCreateStepGroupEndpoint(s),
		GetStepGroups:   makeGetStepGroupsEndpoint(s),
		GetStepGroup:    makeGetStepGroupEndpoint(s),
		EditStepGroup:   makeEditStepGroupEndpoint(s),
		DeleteStepGroup: makeDeleteStepGroupEndpoint(s),

		CreateStep: makeCreateStepEndpoint(s),
		GetSteps:   makeGetStepsEndpoint(s),
		GetStep:    makeGetStepEndpoint(s),
		EditStep:   makeEditStepEndpoint(s),
		DeleteStep: makeDeleteStepEndpoint(s),
	}
}

func makeCreateCaseEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		//if !policy_manager.Check(ctx, "cases", "CanCreateCase") {
		//	return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		//}

		body := request.(CreateCaseRequest)
		cas, err := s.CreateCase(ctx, body.ProjectID, body.SpaceID, body.CaseCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateCaseResponse{
			Case: *cas,
		}, nil
	}
}

func makeGetCasesEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetCasesRequest)

		p, usersData, err := s.GetCases(ctx, body.ProjectID, body.SpaceID, body.Page, body.Limit, body.Folder, body.Sort)
		if err != nil {
			return nil, err
		}

		return GetCasesResponse{
			Cases: p,
			Users: usersData.Users,
		}, nil
	}
}

func makeGetCaseEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetCaseRequest)

		p, err := s.GetCase(ctx, body.ProjectID, body.SpaceID, body.CaseId)
		if err != nil {
			return nil, err
		}

		return GetCaseResponse{
			Case: *p,
		}, nil
	}
}

func makeEditCaseEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(EditCaseRequest)

		if !policy_manager.Check(ctx, "cases", "CanEditAllCases") && !policy_manager.Check(ctx, "cases", "CanEditSomeCases", body.CaseId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		p, err := s.EditCase(ctx, body.ProjectID, body.SpaceID, models.Case{
			Title:         *body.CaseEditRequest.Title,
			Description:   body.CaseEditRequest.Description,
			Preconditions: body.CaseEditRequest.Preconditions,
		}, body.CaseId)
		if err != nil {
			return nil, err
		}

		return EditCaseResponse{
			Case: *p,
		}, nil
	}
}

func makeDeleteCaseEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DeleteCaseRequest)

		if !policy_manager.Check(ctx, "cases", "CanDeleteAllCases") && !policy_manager.Check(ctx, "cases", "CanDeleteSomeCases", body.CaseId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.DeleteCase(ctx, body.ProjectID, body.SpaceID, body.CaseId)
		if err != nil {
			return nil, err
		}

		return DeleteCaseResponse{
			Success: true,
		}, nil
	}
}

func makeCreateStepGroupEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		//if !policy_manager.Check(ctx, "cases", "CanCreateStepGroup") {
		//	return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		//}

		body := request.(CreateStepGroupRequest)
		sg, err := s.CreateStepGroup(ctx, body.CaseID, body.StepGroupCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateStepGroupResponse{
			StepGroup: *sg,
		}, nil
	}
}

func makeGetStepGroupsEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetStepGroupsRequest)

		sg, err := s.GetStepGroups(ctx, body.CaseID)
		if err != nil {
			return nil, err
		}

		return GetStepGroupsResponse{
			StepGroups: sg,
		}, nil
	}
}

func makeGetStepGroupEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetStepGroupRequest)

		sg, err := s.GetStepGroup(ctx, body.CaseID, body.StepGroupID)
		if err != nil {
			return nil, err
		}

		return GetStepGroupResponse{
			StepGroup: *sg,
		}, nil
	}
}

func makeEditStepGroupEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(EditStepGroupRequest)

		if !policy_manager.Check(ctx, "cases", "CanEditAllCases") && !policy_manager.Check(ctx, "cases", "CanEditSomeCases", body.CaseID) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		sg, err := s.EditStepGroup(ctx, body.CaseID, models.StepGroup{
			Result:      body.StepGroupEditRequest.Result,
			CustomOrder: body.StepGroupEditRequest.CustomOrder,
		}, body.StepGroupID)
		if err != nil {
			return nil, err
		}

		return EditStepGroupResponse{
			StepGroup: *sg,
		}, nil
	}
}

func makeDeleteStepGroupEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DeleteStepGroupRequest)

		if !policy_manager.Check(ctx, "cases", "CanDeleteAllCases") && !policy_manager.Check(ctx, "cases", "CanDeleteSomeCases", body.CaseID) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.DeleteStepGroup(ctx, body.CaseID, body.StepGroupID)
		if err != nil {
			return nil, err
		}

		return DeleteStepGroupResponse{
			Success: true,
		}, nil
	}
}

func makeCreateStepEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		//if !policy_manager.Check(ctx, "cases", "CanCreateStep") {
		//	return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		//}

		body := request.(CreateStepRequest)
		sg, err := s.CreateStep(ctx, body.CaseID, body.StepCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateStepResponse{
			Step: *sg,
		}, nil
	}
}

func makeGetStepsEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetStepsRequest)

		sg, err := s.GetSteps(ctx, body.CaseID, body.StepGroupID)
		if err != nil {
			return nil, err
		}

		return GetStepsResponse{
			Steps: sg,
		}, nil
	}
}

func makeGetStepEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetStepRequest)

		sg, err := s.GetStep(ctx, body.CaseID, body.StepGroupID, body.StepID)
		if err != nil {
			return nil, err
		}

		return GetStepResponse{
			Step: *sg,
		}, nil
	}
}

func makeEditStepEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(EditStepRequest)

		if !policy_manager.Check(ctx, "cases", "CanEditAllCases") && !policy_manager.Check(ctx, "cases", "CanEditSomeCases", body.CaseID) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		sg, err := s.EditStep(ctx, body.CaseID, body.StepGroupID, models.Step{
			Content:     body.StepEditRequest.Content,
			CustomOrder: body.StepEditRequest.CustomOrder,
		}, body.StepID)
		if err != nil {
			return nil, err
		}

		return EditStepResponse{
			Step: *sg,
		}, nil
	}
}

func makeDeleteStepEndpoint(s cases.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DeleteStepRequest)

		if !policy_manager.Check(ctx, "cases", "CanDeleteAllCases") && !policy_manager.Check(ctx, "cases", "CanDeleteSomeCases", body.CaseID) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.DeleteStep(ctx, body.CaseID, body.StepID)
		if err != nil {
			return nil, err
		}

		return DeleteStepResponse{
			Success: true,
		}, nil
	}
}
