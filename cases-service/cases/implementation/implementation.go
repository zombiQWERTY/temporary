package implementation

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/cases-service/models"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
	"github.com/biezhi/gorm-paginator/pagination"
	"github.com/sirupsen/logrus"
)

type CasesImpl struct {
	casesRepo     cases.Repository
	consulService service_discovery.ServiceDiscovery
	usersClient   func() (usersPB.UsersServiceClient, error)
	log           *logger.Logger
}

func NewCasesImpl(casesRepo cases.Repository, consulService service_discovery.ServiceDiscovery, log *logrus.Entry, usersClient func() (usersPB.UsersServiceClient, error)) cases.Implementation {
	return &CasesImpl{
		casesRepo:     casesRepo,
		consulService: consulService,
		usersClient:   usersClient,
		log:           logger.UseLogger(log),
	}
}

func (u *CasesImpl) CreateCase(ctx context.Context, projectID uint32, spaceID uint32, data models.CaseCreateRequest) (*models.Case, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateCase")

	usersClient, err := u.usersClient()
	if err != nil {
		log.UsersDownError(err)
		return nil, err
	}

	cas, err := u.casesRepo.CreateCase(ctx, models.Case{
		Title:         data.Title,
		Description:   data.Description,
		Preconditions: data.Preconditions,
		Status:        data.Status,
		Priority:      data.Priority,
		Project:       projectID,
		Space:         spaceID,
		Folder:        data.Folder,
	})
	if err != nil {
		return nil, err
	}

	canReadSomeCases := false
	canEditSomeCases := false
	canDeleteSomeCases := false

	p := make([]*usersPB.Permissions, 0)
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadSomeCases":
			canReadSomeCases = true
			perm.Models = append(perm.Models, cas.ID)
		case "CanEditSomeCases":
			canEditSomeCases = true
			perm.Models = append(perm.Models, cas.ID)
		case "CanDeleteSomeCases":
			canDeleteSomeCases = true
			perm.Models = append(perm.Models, cas.ID)
		}

		p = append(p, &usersPB.Permissions{
			ID:     perm.ID,
			Models: perm.Models,
		})
	}

	casePerms := make([]*usersPB.Permissions, 0)
	if !canReadSomeCases {
		casePerms = append(casePerms, &usersPB.Permissions{
			ID:     53, // CanReadSomeCases
			Models: []uint32{cas.ID},
		})
	}

	if !canEditSomeCases {
		casePerms = append(casePerms, &usersPB.Permissions{
			ID:     55, // CanEditSomeCases
			Models: []uint32{cas.ID},
		})
	}

	if !canDeleteSomeCases {
		casePerms = append(casePerms, &usersPB.Permissions{
			ID:     57, // CanDeleteSomeCases
			Models: []uint32{cas.ID},
		})
	}

	payload := &usersPB.MultiplePermissionsEditRequest{
		TenantID: tenantID,
		PermissionsList: []*usersPB.PermissionsEdit{
			{
				ID:          userID,
				Permissions: append(p, casePerms...),
			},
		},
	}
	resp, err := usersClient.MultiplePermissionsEdit(ctx, payload)

	if err != nil {
		log.UsersDownError(err)
		return nil, err
	}

	if !resp.Success {
		log.WithError(err).WithField("permissionsEditPayload", payload).Error("Cant set permissions")
	}

	return cas, nil
}

func (u *CasesImpl) GetCases(ctx context.Context, projectID, spaceID, page, limit uint32, folder *int32, sort string) (*pagination.Paginator, *usersPB.GetUsersByIDResponse, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetCases")

	p, userIDs, err := u.casesRepo.GetCases(ctx, projectID, spaceID, page, limit, folder, sort)
	if err != nil {
		return nil, nil, err
	}

	usersClient, err := u.usersClient()
	if err != nil {
		log.UsersDownError(err)
		return nil, nil, err
	}

	usersData, err := usersClient.GetUsersByID(ctx, &usersPB.GetUsersByIDRequest{IDs: userIDs, TenantID: tenantID})
	if err != nil {
		log.UsersDownError(err)
		return nil, nil, err
	}

	return p, usersData, nil
}

func (u *CasesImpl) GetCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) (*models.Case, error) {
	p, err := u.casesRepo.GetCase(ctx, projectID, spaceID, id)
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (u *CasesImpl) EditCase(ctx context.Context, projectID uint32, spaceID uint32, data models.Case, id uint32) (*models.Case, error) {
	return u.casesRepo.EditCase(ctx, projectID, spaceID, data, id)
}

func (u *CasesImpl) DeleteCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) error {
	return u.casesRepo.DeleteCase(ctx, projectID, spaceID, id)
}

func (u *CasesImpl) CreateStepGroup(ctx context.Context, caseID uint32, data models.StepGroupCreateRequest) (*models.StepGroup, error) {
	//tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, _ := shared_middleware.ParseContextUserModel(ctx)
	//log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateStepGroup")

	sg, err := u.casesRepo.CreateStepGroup(ctx, caseID, models.StepGroup{
		Result:  data.Result,
		Case:    caseID,
		Creator: userID,
	})

	if err != nil {
		return nil, err
	}

	return sg, nil
}

func (u *CasesImpl) GetStepGroups(ctx context.Context, caseID uint32) ([]models.StepGroup, error) {
	return u.casesRepo.GetStepGroups(ctx, caseID)
}

func (u *CasesImpl) GetStepGroup(ctx context.Context, caseID uint32, id uint32) (*models.StepGroup, error) {
	p, err := u.casesRepo.GetStepGroup(ctx, caseID, id)
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (u *CasesImpl) EditStepGroup(ctx context.Context, caseID uint32, data models.StepGroup, id uint32) (*models.StepGroup, error) {
	return u.casesRepo.EditStepGroup(ctx, caseID, data, id)
}

func (u *CasesImpl) DeleteStepGroup(ctx context.Context, caseID uint32, id uint32) error {
	return u.casesRepo.DeleteStepGroup(ctx, caseID, id)
}

func (u *CasesImpl) CreateStep(ctx context.Context, caseID uint32, data models.StepCreateRequest) (*models.Step, error) {
	//tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, _ := shared_middleware.ParseContextUserModel(ctx)
	//log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateStep")

	sg, err := u.casesRepo.CreateStep(ctx, caseID, models.Step{
		Content:   data.Content,
		StepGroup: data.StepGroupID,
		Creator:   userID,
	})

	if err != nil {
		return nil, err
	}

	return sg, nil
}

func (u *CasesImpl) GetSteps(ctx context.Context, caseID, stepGroupID uint32) ([]models.Step, error) {
	return u.casesRepo.GetSteps(ctx, caseID, stepGroupID)
}

func (u *CasesImpl) GetStep(ctx context.Context, caseID, stepGroupID uint32, id uint32) (*models.Step, error) {
	p, err := u.casesRepo.GetStep(ctx, caseID, stepGroupID, id)
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (u *CasesImpl) EditStep(ctx context.Context, caseID, stepGroupID uint32, data models.Step, id uint32) (*models.Step, error) {
	return u.casesRepo.EditStep(ctx, caseID, stepGroupID, data, id)
}

func (u *CasesImpl) DeleteStep(ctx context.Context, caseID uint32, id uint32) error {
	return u.casesRepo.DeleteStep(ctx, caseID, id)
}

func (u *CasesImpl) CountCases(ctx context.Context, tenantID string, space []uint32) []*pb.CountBySpace {
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CountCases")

	result, err := u.casesRepo.CountCases(ctx, tenantID, space)
	if err != nil {
		log.WithError(err).WithField("space", space).Error("Cant get cases info by space")
	}

	return result
}
