package repository

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/projects-service/models"
	"bitbucket.org/ittinc/projects-service/projects"
	"bitbucket.org/ittinc/projects-service/utils/unique"
	"context"
	"emperror.dev/errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"strings"
	"time"
)

type ProjectsRepository struct {
	postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error)
	log             *logger.Logger
}

func NewProjectsRepository(postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error), log *logrus.Entry) projects.Repository {
	return &ProjectsRepository{
		postgresConnect: postgresConnect,
		log:             logger.UseLogger(log),
	}
}

func (u *ProjectsRepository) CreateProject(ctx context.Context, data models.Project) (*models.Project, error) {
	id, _ := shared_middleware.ParseContextUserModel(ctx)
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateProject")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	data.Creator = id

	if err := db.Create(&data).Save(&data).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "slug") {
				return nil, errors.Append(shared_errors.ErrProjectExists, err)
			}
		}

		log.WithError(err).WithField("project", data).Error("Cant create project")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *ProjectsRepository) GetProjects(ctx context.Context) ([]models.Project, []uint32, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetProjects")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, []uint32{}, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllProjects := false
	canReadSomeProjects := false
	canReadAllSpaces := false
	canReadSomeSpaces := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllProjects":
			// No need in other handling
			canReadAllProjects = true
			continue
		case "CanReadSomeProjects":
			canReadSomeProjects = true
			// Available only if user has no canReadAllProjects permission
			if !canReadAllProjects {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "projects.id IN (?)")
				if len(perm.Models) != 0 {
					whereArguments = append(whereArguments, perm.Models)
				} else {
					// Setting default arguments for query if user CanReadSomeProjects but has no models
					whereArguments = append(whereArguments, []uint32{0})
				}
				continue
			}
		case "CanReadAllSpaces":
			// No need in other handling
			canReadAllSpaces = true
			continue
		case "CanReadSomeSpaces":
			canReadSomeSpaces = true
			if !canReadAllSpaces {
				// spaces.id IS NULL checking used for selecting projects with no spaces too
				whereCondition = append(whereCondition, "(spaces.id IN (?) OR spaces.id IS NULL)")
				if len(perm.Models) != 0 {
					whereArguments = append(whereArguments, perm.Models)
				} else {
					whereArguments = append(whereArguments, []uint32{0})
				}
				continue
			}
		}
	}

	// Prepare conditions
	whereConditions := strings.Join(whereCondition, " AND ")
	if len(whereConditions) > 0 {
		whereConditions = fmt.Sprintf(" AND %s", whereConditions)
	}

	// Disable route if user has no related permissions
	if !canReadAllProjects && !canReadSomeProjects || (!canReadAllProjects && !canReadSomeProjects && !canReadAllSpaces && !canReadSomeSpaces) {
		return nil, []uint32{}, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var projectsData []projectsData
	// Selecting projects and spaces, setting project.starred: true if this project has at least one starred space
	err = db.Raw(fmt.Sprintf(`
WITH t
         AS (SELECT projects.*,
                    spaces.id AS space_id,
                    spaces.created_at AS space_created_at,
                    spaces.updated_at AS space_updated_at,
                    spaces.deleted_at AS space_deleted_at,
                    spaces.custom_order AS space_custom_order,
                    spaces.name AS space_name,
                    spaces.creator AS space_creator
             FROM   projects
                        LEFT JOIN spaces
                                   ON projects.id = spaces.project_id AND spaces.deleted_at IS NULL
             WHERE projects.deleted_at IS NULL %s)
SELECT DISTINCT t.*,
       CASE
           WHEN user_has_starred.space_id = t.space_id AND user_has_starred.user_id = %d THEN true
           ELSE false
           END AS starred
FROM   t
           LEFT JOIN user_has_starred
                     ON user_has_starred.space_id = t.space_id
ORDER BY starred DESC, created_at DESC, t.space_custom_order ASC`, whereConditions, userID), whereArguments...).Scan(&projectsData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return []models.Project{}, []uint32{}, nil
		}

		log.WithError(err).Error("Cant get projects")
		return nil, []uint32{}, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	projs := make([]models.Project, 0)
	usr := make([]uint32, 0)
	// Normalize/group data into []models.Project
	for _, p := range projectsData {
		index, exists := isProjectExists(p.ID, projs)
		if exists {
			if p.SpaceID != 0 {
				usr = append(usr, p.SpaceCreator)
				projs[index].Spaces = append(projs[index].Spaces, makeSpace(p))
			}
		} else {
			usr = append(usr, p.Creator)
			tempProject := makeProject(p)

			if p.SpaceID != 0 {
				usr = append(usr, p.SpaceCreator)
				tempProject.Spaces = []models.Space{makeSpace(p)}
			}

			projs = append(projs, tempProject)
		}
	}

	// Make user ids unique for handling in implementation
	return projs, unique.Uint32(usr), nil
}

// TODO: refactor with prev method
func (u *ProjectsRepository) GetProject(ctx context.Context, id uint32) (*models.Project, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetProject")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllProjects := false
	canReadSomeProjects := false
	canReadAllSpaces := false
	canReadSomeSpaces := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllProjects":
			// No need in other handling
			canReadAllProjects = true
			continue
		case "CanReadSomeProjects":
			canReadSomeProjects = true
			// Available only if user has no canReadAllProjects permission
			if !canReadAllProjects {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "projects.id = (?)")
				if len(perm.Models) != 0 {
					for _, i := range perm.Models {
						if i == id {
							whereArguments = append(whereArguments, []uint32{id})
							break
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeProjects but has no models
					whereArguments = append(whereArguments, []uint32{0})
				}
				continue
			}
		case "CanReadAllSpaces":
			// No need in other handling
			canReadAllSpaces = true
			continue
		case "CanReadSomeSpaces":
			canReadSomeSpaces = true
			if !canReadAllSpaces {
				// spaces.id IS NULL checking used for selecting projects with no spaces too
				whereCondition = append(whereCondition, "(spaces.id IN (?) OR spaces.id IS NULL)")
				if len(perm.Models) != 0 {
					whereArguments = append(whereArguments, perm.Models)
				} else {
					whereArguments = append(whereArguments, []uint32{0})
				}
				continue
			}
		}
	}

	// Prepare conditions
	whereConditions := strings.Join(whereCondition, " AND ")
	if len(whereConditions) > 0 {
		whereConditions = fmt.Sprintf(" AND %s", whereConditions)
	}

	// Disable route if user has no related permissions
	if !canReadAllProjects && !canReadSomeProjects || (!canReadAllProjects && !canReadSomeProjects && !canReadAllSpaces && !canReadSomeSpaces) {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var projectsData []projectsData
	// Selecting projects and spaces, setting project.starred: true if this project has at least one starred space
	err = db.Raw(fmt.Sprintf(`
WITH t
         AS (SELECT projects.*,
                    spaces.id AS space_id,
                    spaces.created_at AS space_created_at,
                    spaces.updated_at AS space_updated_at,
                    spaces.deleted_at AS space_deleted_at,
                    spaces.custom_order AS space_custom_order,
                    spaces.name AS space_name,
                    spaces.creator AS space_creator
             FROM   projects
                        LEFT JOIN spaces
                                   ON projects.id = spaces.project_id
             WHERE projects.deleted_at IS NULL AND spaces.deleted_at IS NULL AND projects.id = %d %s)
SELECT DISTINCT t.*,
       CASE
           WHEN user_has_starred.space_id = t.space_id AND user_has_starred.user_id = %d THEN true
           ELSE false
           END AS starred
FROM   t
           LEFT JOIN user_has_starred
                     ON user_has_starred.space_id = t.space_id
ORDER BY t.space_custom_order ASC`, id, whereConditions, userID), whereArguments...).Scan(&projectsData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.Project{}, nil
		}

		log.WithError(err).Error("Cant get project")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	projs := make([]models.Project, 0)
	usr := make([]uint32, 0)
	// Normalize/group data into []models.Project
	for _, p := range projectsData {
		index, exists := isProjectExists(p.ID, projs)
		if exists {
			if p.SpaceID != 0 {
				usr = append(usr, p.SpaceCreator)
				projs[index].Spaces = append(projs[index].Spaces, makeSpace(p))
			}
		} else {
			usr = append(usr, p.Creator)
			tempProject := makeProject(p)

			if p.SpaceID != 0 {
				usr = append(usr, p.SpaceCreator)
				tempProject.Spaces = []models.Space{makeSpace(p)}
			}

			projs = append(projs, tempProject)
		}
	}

	if len(projs) > 0 {
		return &projs[0], nil
	}

	return &models.Project{}, nil
}

func (u *ProjectsRepository) EditProject(ctx context.Context, data models.Project, id uint32) (*models.Project, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("EditProject")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	if err := db.Model(models.Project{ID: id}).Updates(data).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "slug") {
				return nil, errors.Append(shared_errors.ErrProjectExists, err)
			}
		}

		log.WithError(err).WithField("project", data).Error("Cant edit project")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.Project{ID: id}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *ProjectsRepository) DeleteProject(ctx context.Context, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("DeleteProject")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Delete(models.Project{ID: id}).Error; err != nil {
		log.WithError(err).WithField("project", id).Error("Cant delete project")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *ProjectsRepository) CreateSpace(ctx context.Context, data models.Space) (*models.Space, error) {
	userID, _ := shared_middleware.ParseContextUserModel(ctx)
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateSpace")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	data.Creator = userID

	type Res struct {
		ID uint32
	}
	res := new(Res)

	q := `
INSERT INTO spaces
(
    custom_order,
    name,
    project_id,
    creator
)
VALUES
(
    (
        ((SELECT COUNT(*) FROM spaces where project_id = ?) + 1)
    ),
    ?,
    ?,
    ?
)
RETURNING id;
`
	if err = db.Raw(q, data.ProjectId, data.Name, data.ProjectId, data.Creator).Scan(&res).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "spaces_project_id_name_key") {
				return nil, errors.Append(shared_errors.ErrSpaceExists, err)
			}
		}

		log.WithError(err).WithField("space", data).Error("Cant create space")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.Space{ID: res.ID}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *ProjectsRepository) EditSpace(ctx context.Context, data models.Space, id uint32) (*models.Space, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("EditSpace")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	//if data.CustomOrder != 0 {
	//	var space models.Space
	//	if err := db.Where(models.Space{ID: id}).First(&space).Error; err != nil {
	//		log.WithError(err).WithField("space", data).Error("Cant get space")
	//		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	//	}
	//
	//	if err = drag_drop.Drag(db, "spaces", space.CustomOrder, data.CustomOrder, space.ProjectId); err != nil {
	//		log.WithError(err).WithField("space", data).Error("Cant drag space")
	//		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	//	}
	//
	//	data.CustomOrder = 0
	//}

	if err := db.Model(models.Space{ID: id}).Updates(data).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "slug") {
				return nil, errors.Append(shared_errors.ErrSpaceExists, err)
			}
			if strings.Contains(err.Error(), "name") {
				return nil, errors.Append(shared_errors.ErrSpaceExists, err)
			}
		}

		log.WithError(err).WithField("space", data).Error("Cant edit space")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.Space{ID: id}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *ProjectsRepository) MultipleDNDSpaces(ctx context.Context, ids []uint32, projectID uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("MultipleDNDSpaces")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if len(ids) == 0 {
		return nil
	}

	spacesCount := make([]models.Space, 0)
	err = db.Raw(`SELECT id FROM spaces WHERE project_id = ? AND deleted_at IS NULL`, projectID).Scan(&spacesCount).Error
	if err != nil {
		log.WithError(err).Error("Cant multiple dnd spaces")
		return err
	}

	spacesIds := make([]uint32, 0)
	for _, r := range spacesCount {
		spacesIds = append(spacesIds, r.ID)
	}

	if !equalSlices(spacesIds, ids) {
		return errors.Wrap(shared_errors.ErrValidationFailed, "spaces DND not equals")
	}

	values := make([]string, len(ids))
	for index, id := range ids {
		values[index] = fmt.Sprintf("(%d, %d)", id, index+1)
	}

	query := `
UPDATE spaces
SET
    custom_order = new_values.custom_order,
    updated_at = NOW()
FROM (
         VALUES %s
     ) AS new_values (id, custom_order)
WHERE spaces.id = new_values.id AND spaces.project_id = ?;
`
	err = db.Exec(fmt.Sprintf(query, strings.Join(values, ", ")), projectID).Error
	if err != nil {
		log.WithError(err).Error("Cant multiple dnd spaces")
		return err
	}

	return nil
}

func (u *ProjectsRepository) DeleteSpace(ctx context.Context, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("DeleteSpace")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Exec("UPDATE spaces SET name = name || '_' || ? WHERE id = ?", time.Now().Unix(), id).Delete(models.Space{ID: id}).Error; err != nil {
		log.WithError(err).WithField("space", id).Error("Cant delete space")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *ProjectsRepository) StarSpace(ctx context.Context, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, _ := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("StarSpace")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	var space models.Space
	if err := db.Where(models.Space{ID: id}).First(&space).Error; err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return nil
		}

		return shared_errors.ErrDatabaseDown
	}

	var starredSpace models.Starred
	if err := db.Raw("SELECT * FROM user_has_starred WHERE space_id = ? LIMIT 1", space.ID).Scan(&starredSpace).Error; err != nil {
		if !gorm.IsRecordNotFoundError(err) {
			return shared_errors.ErrDatabaseDown
		}
	}

	if starredSpace.ID != 0 {
		return nil
	}

	if err := db.Exec("INSERT INTO user_has_starred (space_id, user_id, project_id) VALUES (?, ?, ?)", id, userID, space.ProjectId).Error; err != nil {
		log.WithError(err).WithField("space", id).Error("Cant star space")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *ProjectsRepository) UnStarSpace(ctx context.Context, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	userID, _ := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("UnStarSpace")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Exec("DELETE FROM user_has_starred WHERE user_id = ? AND space_id = ?", userID, id).Error; err != nil {
		log.WithError(err).WithField("space", id).Error("Cant unStar space")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func isProjectExists(id uint32, projects []models.Project) (index int, result bool) {
	result = false
	index = 0
	for i, product := range projects {
		if product.ID == id {
			result = true
			index = i
			break
		}
	}
	return index, result
}

type projectsData struct {
	ID        uint32     `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `sql:"index" json:"-"`

	Slug        string  `gorm:"type:varchar(4) unique" json:"slug"`
	Name        string  `gorm:"type:varchar(100)" json:"name"`
	Description *string `gorm:"type:varchar(500)" json:"description"`
	Creator     uint32  `gorm:"type:integer" json:"creator"`
	Starred     bool    `gorm:"-" json:"starred"`

	SpaceID        uint32     `gorm:"primary_key" json:"id"`
	SpaceCreatedAt time.Time  `json:"createdAt"`
	SpaceUpdatedAt time.Time  `json:"updatedAt"`
	SpaceDeletedAt *time.Time `sql:"index" json:"-"`

	SpaceName        string `gorm:"type:varchar(100)" json:"name"`
	SpaceCreator     uint32 `gorm:"type:integer" json:"creator"`
	SpaceCustomOrder int32  `gorm:"type:integer" json:"order"`
}

func makeSpace(p projectsData) models.Space {
	return models.Space{
		ID:          p.SpaceID,
		CreatedAt:   p.SpaceCreatedAt,
		UpdatedAt:   p.SpaceUpdatedAt,
		DeletedAt:   p.SpaceDeletedAt,
		Name:        p.SpaceName,
		Creator:     p.SpaceCreator,
		CustomOrder: p.SpaceCustomOrder,
		Starred:     p.Starred,
		ProjectId:   p.ID,
	}
}

func makeProject(p projectsData) models.Project {
	return models.Project{
		ID:          p.ID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		DeletedAt:   p.DeletedAt,
		Slug:        p.Slug,
		Name:        p.Name,
		Description: p.Description,
		Creator:     p.Creator,
		Starred:     p.Starred,
	}
}

func equalSlices(a, b []uint32) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}
