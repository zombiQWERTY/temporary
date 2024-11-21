package cases

import (
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/cases-service/models"
	"context"
	"github.com/biezhi/gorm-paginator/pagination"
)

type Repository interface {
	CreateCase(ctx context.Context, data models.Case) (*models.Case, error)
	EditCase(ctx context.Context, projectID uint32, spaceID uint32, data models.Case, id uint32) (*models.Case, error)
	GetCases(ctx context.Context, projectID uint32, spaceID, page, limit uint32, folder *int32, sort string) (*pagination.Paginator, []uint32, error)
	GetCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) (*models.Case, error)
	DeleteCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) error

	CreateStepGroup(ctx context.Context, caseID uint32, data models.StepGroup) (*models.StepGroup, error)
	EditStepGroup(ctx context.Context, caseID uint32, data models.StepGroup, id uint32) (*models.StepGroup, error)
	GetStepGroups(ctx context.Context, caseID uint32) ([]models.StepGroup, error)
	GetStepGroup(ctx context.Context, caseID uint32, id uint32) (*models.StepGroup, error)
	DeleteStepGroup(ctx context.Context, caseID uint32, id uint32) error

	CreateStep(ctx context.Context, caseID uint32, data models.Step) (*models.Step, error)
	EditStep(ctx context.Context, caseID, stepGroupID uint32, data models.Step, id uint32) (*models.Step, error)
	GetSteps(ctx context.Context, caseID, stepGroupID uint32) ([]models.Step, error)
	GetStep(ctx context.Context, caseID, stepGroupID uint32, id uint32) (*models.Step, error)
	DeleteStep(ctx context.Context, caseID uint32, id uint32) error

	CountCases(ctx context.Context, tenantID string, space []uint32) ([]*pb.CountBySpace, error)
}
