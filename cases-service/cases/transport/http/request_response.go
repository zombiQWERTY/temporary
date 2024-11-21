package http

import (
	"bitbucket.org/ittinc/cases-service/models"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"github.com/biezhi/gorm-paginator/pagination"
)

type CreateCaseRequest struct {
	ProjectID                uint32 `valid:"int,required"`
	SpaceID                  uint32 `valid:"int,required"`
	models.CaseCreateRequest `valid:"optional"`
}

type CreateCaseResponse struct {
	Case models.Case `json:"case"`
}

type GetCasesRequest struct {
	ProjectID uint32 `valid:"int,required"`
	SpaceID   uint32 `valid:"int,required"`
	Page      uint32 `valid:"int"`
	Limit     uint32 `valid:"int"`
	Folder    *int32 `valid:"int,optional"`
	Sort      string `valid:"stringlength(2|100),optional"`
}

type GetCasesResponse struct {
	Cases *pagination.Paginator      `json:"cases"`
	Users []*usersPB.GetUserResponse `json:"users"`
}

type EditCaseRequest struct {
	ProjectID              uint32 `valid:"int,required"`
	SpaceID                uint32 `valid:"int,required"`
	CaseId                 uint32 `valid:"int,required"`
	models.CaseEditRequest `valid:"optional"`
}

type EditCaseResponse struct {
	Case models.Case `json:"case"`
}

type GetCaseRequest struct {
	ProjectID uint32 `valid:"int,required"`
	SpaceID   uint32 `valid:"int,required"`
	CaseId    uint32 `valid:"int,required"`
}

type GetCaseResponse struct {
	Case models.Case `json:"case"`
}

type DeleteCaseRequest struct {
	ProjectID uint32 `valid:"int,required"`
	SpaceID   uint32 `valid:"int,required"`
	CaseId    uint32 `valid:"int,required"`
}

type DeleteCaseResponse struct {
	Success bool `json:"success"`
}

type CreateStepGroupRequest struct {
	CaseID                        uint32 `valid:"int,required"`
	models.StepGroupCreateRequest `valid:"optional"`
}

type CreateStepGroupResponse struct {
	StepGroup models.StepGroup `json:"stepGroup"`
}

type GetStepGroupsRequest struct {
	CaseID uint32 `valid:"int,required"`
}

type GetStepGroupsResponse struct {
	StepGroups []models.StepGroup         `json:"stepGroups"`
	Users      []*usersPB.GetUserResponse `json:"users"`
}

type EditStepGroupRequest struct {
	CaseID                      uint32 `valid:"int,required"`
	StepGroupID                 uint32 `valid:"int,required"`
	models.StepGroupEditRequest `valid:"optional"`
}

type EditStepGroupResponse struct {
	StepGroup models.StepGroup `json:"stepGroup"`
}

type GetStepGroupRequest struct {
	CaseID      uint32 `valid:"int,required"`
	StepGroupID uint32 `valid:"int,required"`
}

type GetStepGroupResponse struct {
	StepGroup models.StepGroup `json:"stepGroup"`
}

type DeleteStepGroupRequest struct {
	CaseID      uint32 `valid:"int,required"`
	StepGroupID uint32 `valid:"int,required"`
}

type DeleteStepGroupResponse struct {
	Success bool `json:"success"`
}

type CreateStepRequest struct {
	CaseID                   uint32 `valid:"int,required"`
	models.StepCreateRequest `valid:"optional"`
}

type CreateStepResponse struct {
	Step models.Step `json:"step"`
}

type GetStepsRequest struct {
	CaseID      uint32 `valid:"int,required"`
	StepGroupID uint32 `valid:"int,required"`
}

type GetStepsResponse struct {
	Steps []models.Step              `json:"steps"`
	Users []*usersPB.GetUserResponse `json:"users"`
}

type EditStepRequest struct {
	CaseID                 uint32 `valid:"int,required"`
	StepGroupID            uint32 `valid:"int,required"`
	StepID                 uint32 `valid:"int,required"`
	models.StepEditRequest `valid:"optional"`
}

type EditStepResponse struct {
	Step models.Step `json:"step"`
}

type GetStepRequest struct {
	CaseID      uint32 `valid:"int,required"`
	StepID      uint32 `valid:"int,required"`
	StepGroupID uint32 `valid:"int,required"`
}

type GetStepResponse struct {
	Step models.Step `json:"step"`
}

type DeleteStepRequest struct {
	CaseID uint32 `valid:"int,required"`
	StepID uint32 `valid:"int,required"`
}

type DeleteStepResponse struct {
	Success bool `json:"success"`
}
