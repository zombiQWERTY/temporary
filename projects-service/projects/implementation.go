package projects

import (
	"bitbucket.org/ittinc/projects-service/models"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
)

type Implementation interface {
	CreateProject(ctx context.Context, data models.ProjectCreateRequest) (*models.Project, error)
	EditProject(ctx context.Context, data models.Project, id uint32) (*models.Project, error)
	GetProjects(ctx context.Context) ([]models.Project, *usersPB.GetUsersByIDResponse, error)
	GetProject(ctx context.Context, id uint32) (*models.Project, error)
	DeleteProject(ctx context.Context, id uint32) error
	CreateSpace(ctx context.Context, data models.SpaceCreateRequest) (*models.Space, error)
	EditSpace(ctx context.Context, data models.Space, id uint32) (*models.Space, error)
	MultipleDNDSpaces(ctx context.Context, ids []uint32, projectID uint32) error
	DeleteSpace(ctx context.Context, id uint32) error
	StarSpace(ctx context.Context, id uint32) error
	UnStarSpace(ctx context.Context, id uint32) error
}
