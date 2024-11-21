package http

import (
	"bitbucket.org/ittinc/go-shared-packages/policy-manager"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/projects-service/models"
	"bitbucket.org/ittinc/projects-service/projects"
	"context"
	"emperror.dev/errors"
	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	CreateProject endpoint.Endpoint
	GetProjects   endpoint.Endpoint
	GetProject    endpoint.Endpoint
	EditProject   endpoint.Endpoint
	DeleteProject endpoint.Endpoint
	CreateSpace   endpoint.Endpoint
	EditSpace     endpoint.Endpoint
	DNDSpaces     endpoint.Endpoint
	DeleteSpace   endpoint.Endpoint
	StarSpace     endpoint.Endpoint
	UnStarSpace   endpoint.Endpoint
}

func MakeEndpoints(s projects.Implementation) Endpoints {
	return Endpoints{
		CreateProject: makeCreateProjectEndpoint(s),
		GetProjects:   makeGetProjectsEndpoint(s),
		GetProject:    makeGetProjectEndpoint(s),
		EditProject:   makeEditProjectEndpoint(s),
		DeleteProject: makeDeleteProjectEndpoint(s),
		CreateSpace:   makeCreateSpaceEndpoint(s),
		EditSpace:     makeEditSpaceEndpoint(s),
		DNDSpaces:     makeDNDSpacesEndpoint(s),
		DeleteSpace:   makeDeleteSpaceEndpoint(s),
		StarSpace:     makeStarSpaceEndpoint(s),
		UnStarSpace:   makeUnStarSpaceEndpoint(s),
	}
}

func makeCreateProjectEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		if !policy_manager.Check(ctx, "projects", "CanCreateProjects") {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		body := request.(CreateProjectRequest)
		project, err := s.CreateProject(ctx, body.ProjectCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateProjectResponse{
			Project: *project,
		}, nil
	}
}

func makeGetProjectsEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		p, usersData, err := s.GetProjects(ctx)
		if err != nil {
			return nil, err
		}

		return GetProjectsResponse{
			Projects: p,
			Users:    usersData.Users,
		}, nil
	}
}

func makeGetProjectEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(GetProjectRequest)

		p, err := s.GetProject(ctx, body.ProjectId)
		if err != nil {
			return nil, err
		}

		return GetProjectResponse{
			Project: *p,
		}, nil
	}
}

func makeEditProjectEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(EditProjectRequest)

		if !policy_manager.Check(ctx, "projects", "CanEditAllProjects") && !policy_manager.Check(ctx, "projects", "CanEditSomeProjects", body.ProjectId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		p, err := s.EditProject(ctx, models.Project{Name: body.ProjectEditRequest.Name, Description: &body.ProjectEditRequest.Description}, body.ProjectId)
		if err != nil {
			return nil, err
		}

		return EditProjectResponse{
			Project: *p,
		}, nil
	}
}

func makeDeleteProjectEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DeleteProjectRequest)

		if !policy_manager.Check(ctx, "projects", "CanDeleteAllProjects") && !policy_manager.Check(ctx, "projects", "CanDeleteSomeProjects", body.ProjectId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.DeleteProject(ctx, body.ProjectId)
		if err != nil {
			return nil, err
		}

		return DeleteProjectResponse{
			Success: true,
		}, nil
	}
}

func makeCreateSpaceEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(CreateSpaceRequest)

		if !policy_manager.Check(ctx, "projects", "CanCreateSpaceInAllProjects") && !policy_manager.Check(ctx, "projects", "CanCreateSpaceInSomeProjects", body.ProjectId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		space, err := s.CreateSpace(ctx, body.SpaceCreateRequest)
		if err != nil {
			return nil, err
		}

		return CreateSpaceResponse{
			Space: *space,
		}, nil
	}
}

func makeEditSpaceEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(EditSpaceRequest)

		if !policy_manager.Check(ctx, "spaces", "CanEditAllSpaces") && !policy_manager.Check(ctx, "spaces", "CanEditSomeSpaces", body.SpaceId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		s, err := s.EditSpace(ctx, models.Space{Name: body.SpaceEditRequest.Name, CustomOrder: body.SpaceEditRequest.CustomOrder}, body.SpaceId)
		if err != nil {
			return nil, err
		}

		return EditSpaceResponse{
			Space: *s,
		}, nil
	}
}

func makeDNDSpacesEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DNDSpacesRequest)

		if !policy_manager.Check(ctx, "spaces", "CanEditAllSpaces") &&
			!policy_manager.Check(ctx, "spaces", "CanEditAllProjects") &&
			!policy_manager.Check(ctx, "projects", "CanEditSomeProjects", body.ProjectID) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.MultipleDNDSpaces(ctx, body.Spaces, body.ProjectID)
		if err != nil {
			return nil, err
		}

		return DNDSpacesResponse{Success: true}, nil
	}
}

func makeDeleteSpaceEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(DeleteSpaceRequest)

		if !policy_manager.Check(ctx, "spaces", "CanDeleteAllSpaces") && !policy_manager.Check(ctx, "spaces", "CanDeleteSomeSpaces", body.ProjectId) {
			return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
		}

		err := s.DeleteSpace(ctx, body.SpaceId)
		if err != nil {
			return nil, err
		}

		return DeleteSpaceResponse{
			Success: true,
		}, nil
	}
}

func makeStarSpaceEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(StarRequest)
		err := s.StarSpace(ctx, body.ID)
		if err != nil {
			return nil, err
		}

		return StarResponse{
			Success: true,
		}, nil
	}
}

func makeUnStarSpaceEndpoint(s projects.Implementation) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		body := request.(StarRequest)
		err := s.UnStarSpace(ctx, body.ID)
		if err != nil {
			return nil, err
		}

		return StarResponse{
			Success: true,
		}, nil
	}
}
