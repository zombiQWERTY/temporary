package implementation

import (
	casesPB "bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/projects-service/models"
	"bitbucket.org/ittinc/projects-service/projects"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
	"github.com/sirupsen/logrus"
)

type ProjectsImpl struct {
	projectsRepo  projects.Repository
	consulService service_discovery.ServiceDiscovery
	usersClient   func() (usersPB.UsersServiceClient, error)
	casesClient   func() (casesPB.CasesServiceClient, error)
	log           *logger.Logger
}

func NewProjectsImpl(projectsRepo projects.Repository, consulService service_discovery.ServiceDiscovery, log *logrus.Entry, usersClient func() (usersPB.UsersServiceClient, error), casesClient func() (casesPB.CasesServiceClient, error)) projects.Implementation {
	return &ProjectsImpl{
		projectsRepo:  projectsRepo,
		consulService: consulService,
		usersClient:   usersClient,
		casesClient:   casesClient,
		log:           logger.UseLogger(log),
	}
}

func (u *ProjectsImpl) CreateProject(ctx context.Context, data models.ProjectCreateRequest) (*models.Project, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateProject")

	usersClient, err := u.usersClient()
	if err != nil {
		log.UsersDownError(err)
		return nil, err
	}

	project, err := u.projectsRepo.CreateProject(ctx, models.Project{Name: data.Name, Slug: data.Slug, Description: data.Description})
	if err != nil {
		return nil, err
	}

	canReadSomeProjects := false
	canEditSomeProjects := false
	canDeleteSomeProjects := false
	canGrantReadSomeProjects := false
	canGrantEditSomeProjects := false
	canGrantDeleteSomeProjects := false
	canCreateSpaceInSomeProjects := false
	canGrantCreateSpaceInSomeProjects := false

	p := make([]*usersPB.Permissions, 0)
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadSomeProjects":
			canReadSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanEditSomeProjects":
			canEditSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanDeleteSomeProjects":
			canDeleteSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanGrantReadSomeProjects":
			canGrantReadSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanGrantEditSomeProjects":
			canGrantEditSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanGrantDeleteSomeProjects":
			canGrantDeleteSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanCreateSpaceInSomeProjects":
			canCreateSpaceInSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		case "CanGrantCreateSpaceInSomeProjects":
			canGrantCreateSpaceInSomeProjects = true
			perm.Models = append(perm.Models, project.ID)
		}

		p = append(p, &usersPB.Permissions{
			ID:     perm.ID,
			Models: perm.Models,
		})
	}

	projectPerms := make([]*usersPB.Permissions, 0)
	if !canReadSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     15, // CanReadSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canEditSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     17, // CanEditSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canDeleteSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     19, // CanDeleteSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canGrantReadSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     24, // CanGrantReadSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canGrantEditSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     26, // CanGrantEditSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canCreateSpaceInSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     29, // CanCreateSpaceInSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canGrantCreateSpaceInSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     85, // CanGrantCreateSpaceInSomeProjects
			Models: []uint32{project.ID},
		})
	}

	if !canGrantDeleteSomeProjects {
		projectPerms = append(projectPerms, &usersPB.Permissions{
			ID:     28, // CanGrantDeleteSomeProjects
			Models: []uint32{project.ID},
		})
	}

	payload := &usersPB.MultiplePermissionsEditRequest{
		TenantID: tenantID,
		PermissionsList: []*usersPB.PermissionsEdit{
			{
				ID:          userID,
				Permissions: append(p, projectPerms...),
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

	return project, nil
}

func (u *ProjectsImpl) GetProjects(ctx context.Context) ([]models.Project, *usersPB.GetUsersByIDResponse, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetProjects")

	p, userIDs, err := u.projectsRepo.GetProjects(ctx)
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

	allSpacesIDs := make([]uint32, 0)
	for _, proj := range p {
		for _, sp := range proj.Spaces {
			allSpacesIDs = append(allSpacesIDs, sp.ID)
		}
	}

	isCasesAvailable := true
	casesClient, err := u.casesClient()
	if err != nil {
		log.CasesDownError(err)
		isCasesAvailable = false
	}

	var res *casesPB.CountCasesResponse
	if isCasesAvailable {
		res, err = casesClient.CountCases(context.Background(), &casesPB.CountCasesRequest{
			Space:    allSpacesIDs,
			TenantID: tenantID,
		})

		if err != nil {
			log.CasesDownError(err)
			isCasesAvailable = false
		}
	}

	if isCasesAvailable {
		for projIndex := range p {
			for spIndex := range p[projIndex].Spaces {
				p[projIndex].Spaces[spIndex].RunsCount = 0
				for _, r := range res.Result {
					if p[projIndex].Spaces[spIndex].ID == r.Space {
						p[projIndex].Spaces[spIndex].CasesCount = r.Count
					}
				}
			}
		}
	}

	return p, usersData, nil
}

func (u *ProjectsImpl) GetProject(ctx context.Context, id uint32) (*models.Project, error) {
	p, err := u.projectsRepo.GetProject(ctx, id)
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (u *ProjectsImpl) EditProject(ctx context.Context, data models.Project, id uint32) (*models.Project, error) {
	return u.projectsRepo.EditProject(ctx, models.Project{Name: data.Name, Description: data.Description}, id)
}

func (u *ProjectsImpl) DeleteProject(ctx context.Context, id uint32) error {
	return u.projectsRepo.DeleteProject(ctx, id)
}

func (u *ProjectsImpl) CreateSpace(ctx context.Context, data models.SpaceCreateRequest) (*models.Space, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateSpace")

	usersClient, err := u.usersClient()
	if err != nil {
		log.UsersDownError(err)
		return nil, err
	}

	space, err := u.projectsRepo.CreateSpace(ctx, models.Space{Name: data.Name, ProjectId: data.ProjectId})
	if err != nil {
		return nil, err
	}

	canReadSomeSpaces := false
	canEditSomeSpaces := false
	canDeleteSomeSpaces := false
	canGrantReadSomeSpaces := false
	canGrantEditSomeSpaces := false
	canGrantDeleteSomeSpaces := false

	p := make([]*usersPB.Permissions, 0)
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadSomeSpaces":
			canReadSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		case "CanEditSomeSpaces":
			canEditSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		case "CanDeleteSomeSpaces":
			canDeleteSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		case "CanGrantReadSomeSpaces":
			canGrantReadSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		case "CanGrantEditSomeSpaces":
			canGrantEditSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		case "CanGrantDeleteSomeSpaces":
			canGrantDeleteSomeSpaces = true
			perm.Models = append(perm.Models, space.ID)
		}

		p = append(p, &usersPB.Permissions{
			ID:     perm.ID,
			Models: perm.Models,
		})
	}

	spacePerms := make([]*usersPB.Permissions, 0)
	if !canReadSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     35, // CanReadSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	if !canEditSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     37, // CanEditSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	if !canDeleteSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     39, // CanDeleteSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	if !canGrantReadSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     46, // CanGrantReadSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	if !canGrantEditSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     48, // CanGrantEditSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	if !canGrantDeleteSomeSpaces {
		spacePerms = append(spacePerms, &usersPB.Permissions{
			ID:     50, // CanGrantDeleteSomeSpaces
			Models: []uint32{space.ID},
		})
	}

	payload := &usersPB.MultiplePermissionsEditRequest{
		TenantID: tenantID,
		PermissionsList: []*usersPB.PermissionsEdit{
			{
				ID:          userID,
				Permissions: append(p, spacePerms...),
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

	return space, nil
}

func (u *ProjectsImpl) EditSpace(ctx context.Context, data models.Space, id uint32) (*models.Space, error) {
	return u.projectsRepo.EditSpace(ctx, models.Space{Name: data.Name, CustomOrder: data.CustomOrder}, id)
}

func (u *ProjectsImpl) MultipleDNDSpaces(ctx context.Context, ids []uint32, projectID uint32) error {
	return u.projectsRepo.MultipleDNDSpaces(ctx, ids, projectID)
}

func (u *ProjectsImpl) DeleteSpace(ctx context.Context, id uint32) error {
	return u.projectsRepo.DeleteSpace(ctx, id)
}

func (u *ProjectsImpl) StarSpace(ctx context.Context, id uint32) error {
	return u.projectsRepo.StarSpace(ctx, id)
}

func (u *ProjectsImpl) UnStarSpace(ctx context.Context, id uint32) error {
	return u.projectsRepo.UnStarSpace(ctx, id)
}
