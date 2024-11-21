package http

import (
	"bitbucket.org/ittinc/projects-service/models"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
)

type CreateProjectRequest struct {
	models.ProjectCreateRequest `valid:"optional"`
}

type CreateProjectResponse struct {
	Project models.Project `json:"project"`
}

type GetProjectsResponse struct {
	Projects []models.Project           `json:"projects"`
	Users    []*usersPB.GetUserResponse `json:"users"`
}

type EditProjectRequest struct {
	ProjectId                 uint32 `valid:"int,required"`
	models.ProjectEditRequest `valid:"optional"`
}

type EditProjectResponse struct {
	Project models.Project `json:"project"`
}

type GetProjectRequest struct {
	ProjectId uint32 `valid:"int,required"`
}

type GetProjectResponse struct {
	Project models.Project `json:"project"`
}

type DeleteProjectRequest struct {
	ProjectId uint32 `valid:"int,required"`
}

type DeleteProjectResponse struct {
	Success bool `json:"success"`
}

type CreateSpaceRequest struct {
	models.SpaceCreateRequest `valid:"optional"`
}

type CreateSpaceResponse struct {
	Space models.Space `json:"space"`
}

type EditSpaceRequest struct {
	SpaceId                 uint32 `valid:"int,required"`
	models.SpaceEditRequest `valid:"optional"`
}

type EditSpaceResponse struct {
	Space models.Space `json:"space"`
}

type DNDSpacesRequest struct {
	Spaces    []uint32 `valid:"int,required"`
	ProjectID uint32   `valid:"int,required"`
}

type DNDSpacesResponse struct {
	Success bool `json:"success"`
}

type DeleteSpaceRequest struct {
	SpaceId uint32 `valid:"int,required"`
}

type DeleteSpaceResponse struct {
	Success bool `json:"success"`
}

type StarResponse struct {
	Success bool `json:"success"`
}

type StarRequest struct {
	ID uint32 `valid:"int,required"`
}
