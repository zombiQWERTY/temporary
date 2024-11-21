package repository

import (
	"bitbucket.org/ittinc/cases-service/cases"
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"bitbucket.org/ittinc/cases-service/models"
	"bitbucket.org/ittinc/cases-service/utils/unique"
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"context"
	"emperror.dev/errors"
	"fmt"
	"github.com/biezhi/gorm-paginator/pagination"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"strings"
)

type CasesRepository struct {
	postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error)
	log             *logger.Logger
}

func NewCasesRepository(postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error), log *logrus.Entry) cases.Repository {
	return &CasesRepository{
		postgresConnect: postgresConnect,
		log:             logger.UseLogger(log),
	}
}

func (u *CasesRepository) CreateCase(ctx context.Context, data models.Case) (*models.Case, error) {
	id, perms := shared_middleware.ParseContextUserModel(ctx)
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateCase")

	canCreateCaseInThisProject := false
	for _, perm := range perms {
		if perm.Name == "CanReadSomeProjects" {
			for _, model := range perm.Models {
				if model == data.Project {
					canCreateCaseInThisProject = true
					break
				}
			}
		}
	}

	canCreateCaseInThisSpace := false
	for _, perm := range perms {
		if perm.Name == "CanReadSomeSpaces" {
			for _, model := range perm.Models {
				if model == data.Space {
					canCreateCaseInThisSpace = true
					break
				}
			}
		}
	}

	if !canCreateCaseInThisProject || !canCreateCaseInThisSpace {
		return nil, shared_errors.ErrForbidden
	}

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	data.Creator = id

	if err := db.Create(&data).Save(&data).Error; err != nil {
		log.WithError(err).WithField("case", data).Error("Cant create case")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) GetCases(ctx context.Context, projectID uint32, spaceID, page, limit uint32, folder *int32, sort string) (*pagination.Paginator, []uint32, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetCases")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, []uint32{}, shared_errors.ErrDatabaseDown
	}

	allowedRows := []string{"id", "created_at", "updated_at", "title", "creator", "status", "priority"}
	allowedSorts := []string{"asc", "desc"}

	var sorting = make([]string, 0)
	if len(sort) != 0 {
		sortRules := strings.Split(strings.ToLower(sort), "|")
		if len(sortRules) > 0 {
			for _, rule := range sortRules {
				preparedRule := strings.Split(rule, ":")
				if len(preparedRule) == 2 && contains(allowedRows, preparedRule[0]) && contains(allowedSorts, preparedRule[1]) {
					sorting = append(sorting, strings.Join(preparedRule, " "))
				}
			}
		}
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	folderSort := ""
	var NO_FOLDER int32 = -1
	if folder != nil && *folder == NO_FOLDER {
		folderSort = "folder IS NULL"
	}

	if folder != nil && *folder != NO_FOLDER {
		folderSort = fmt.Sprintf("folder = %d", *folder)
	}

	if len(folderSort) != 0 {
		whereCondition = append(whereCondition, folderSort)
	}

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "cases.id IN (?)")
				if len(perm.Models) != 0 {
					whereArguments = append(whereArguments, perm.Models)
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
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
	if !canReadAllCases && !canReadSomeCases {
		return nil, []uint32{}, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var casesData []models.Case
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	db = db.Where(fmt.Sprintf(`project = %d AND space = %d %s`, projectID, spaceID, whereConditions), whereArguments...)

	paginator := pagination.Paging(&pagination.Param{
		DB:      db,
		Page:    int(page),
		Limit:   int(limit),
		OrderBy: []string{strings.Join(sorting, ", ")},
	}, &casesData)

	usr := make([]uint32, 0)
	for _, p := range casesData {
		usr = append(usr, p.Creator)
	}

	return paginator, unique.Uint32(usr), nil
}

// TODO: refactor with prev method
func (u *CasesRepository) GetCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) (*models.Case, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetCase")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "id = (?)")
				if len(perm.Models) != 0 {
					for _, i := range perm.Models {
						if i == id {
							whereArguments = append(whereArguments, []uint32{id})
							break
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
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
	if !canReadAllCases && !canReadSomeCases {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	var casesData []models.Case
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	err = db.Raw(fmt.Sprintf(`
SELECT * FROM cases 
WHERE deleted_at IS NULL AND project = %d AND space = %d AND id = %d %s`, projectID, spaceID, id, whereConditions), whereArguments...).Scan(&casesData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.Case{}, nil
		}

		log.WithError(err).Error("Cant get case")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if len(casesData) == 0 {
		return &models.Case{}, nil
	}

	var currentCase = &casesData[0]

	var stepGroupData []models.StepGroup
	err = db.Raw(`
SELECT * FROM step_groups 
WHERE deleted_at IS NULL AND "case" = ?`, id).Scan(&stepGroupData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.Case{}, nil
		}

		log.WithError(err).Error("Cant get stepGroups")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	var stepGroupsIDs = make([]uint32, 0)
	for _, group := range stepGroupData {
		stepGroupsIDs = append(stepGroupsIDs, group.ID)
	}

	var stepsData []models.Step
	err = db.Raw(`
SELECT * FROM steps
WHERE deleted_at IS NULL AND step_group IN (?)`, stepGroupsIDs).Scan(&stepsData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.Case{}, nil
		}

		log.WithError(err).Error("Cant get steps")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	for idx := range stepGroupData {
		for _, step := range stepsData {
			if stepGroupData[idx].ID == step.StepGroup {
				stepGroupData[idx].Steps = append(stepGroupData[idx].Steps, step)
			}
		}
	}

	currentCase.StepGroups = stepGroupData

	return currentCase, nil
}

func (u *CasesRepository) EditCase(ctx context.Context, projectID uint32, spaceID uint32, data models.Case, id uint32) (*models.Case, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("EditCase")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	if err := db.Model(models.Case{ID: id, Project: projectID, Space: spaceID}).Updates(data).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "slug") {
				return nil, errors.Append(shared_errors.ErrCaseExists, err)
			}
		}

		log.WithError(err).WithField("case", data).Error("Cant edit case")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.Case{ID: id}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) DeleteCase(ctx context.Context, projectID uint32, spaceID uint32, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("DeleteCase")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Delete(models.Case{ID: id, Project: projectID, Space: spaceID}).Error; err != nil {
		log.WithError(err).WithField("case", id).Error("Cant delete case")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *CasesRepository) CreateStepGroup(ctx context.Context, caseID uint32, data models.StepGroup) (*models.StepGroup, error) {
	id, _ := shared_middleware.ParseContextUserModel(ctx)
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateStepGroup")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	data.Creator = id
	data.Case = caseID

	if err := db.Create(&data).Save(&data).Error; err != nil {
		log.WithError(err).WithField("stepGroup", data).Error("Cant create stepGroup")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) GetStepGroups(ctx context.Context, caseID uint32) ([]models.StepGroup, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetStepGroups")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "\"case\" IN (?)")
				if len(perm.Models) != 0 {
					for _, modelID := range perm.Models {
						if modelID == caseID {
							whereArguments = append(whereArguments, []uint32{caseID})
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
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
	if !canReadAllCases && !canReadSomeCases {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var stepGroupData []models.StepGroup
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	err = db.Raw(fmt.Sprintf(`
SELECT * FROM step_groups WHERE deleted_at IS NULL %s
ORDER BY created_at DESC, custom_order ASC`, whereConditions), whereArguments...).Scan(&stepGroupData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return []models.StepGroup{}, nil
		}

		log.WithError(err).Error("Cant get cases")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	// Make user ids unique for handling in implementation
	return stepGroupData, nil
}

// TODO: refactor with prev method
func (u *CasesRepository) GetStepGroup(ctx context.Context, caseID uint32, id uint32) (*models.StepGroup, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetStepGroup")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "\"case\" = ?")
				if len(perm.Models) != 0 {
					for _, i := range perm.Models {
						if i == caseID {
							whereArguments = append(whereArguments, caseID)
							break
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
					whereArguments = append(whereArguments, 0)
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
	if !canReadAllCases && !canReadSomeCases {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var stepGroupData []models.StepGroup
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	err = db.Raw(fmt.Sprintf(`
SELECT * FROM step_groups 
WHERE deleted_at IS NULL AND id = %d %s`, id, whereConditions), whereArguments...).Scan(&stepGroupData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.StepGroup{}, nil
		}

		log.WithError(err).Error("Cant get case")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if len(stepGroupData) > 0 {
		return &stepGroupData[0], nil
	}

	return &models.StepGroup{}, nil
}

func (u *CasesRepository) EditStepGroup(ctx context.Context, caseID uint32, data models.StepGroup, id uint32) (*models.StepGroup, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("EditStepGroup")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	if err := db.Model(models.StepGroup{ID: id, Case: caseID}).Updates(data).Error; err != nil {
		log.WithError(err).WithField("stepGroup", data).Error("Cant edit stepGroup")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.StepGroup{ID: id}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) DeleteStepGroup(ctx context.Context, caseID uint32, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("DeleteStepGroup")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Delete(models.StepGroup{ID: id, Case: caseID}).Error; err != nil {
		log.WithError(err).WithField("stepGroup", id).Error("Cant delete stepGroup")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *CasesRepository) CreateStep(ctx context.Context, stepGroupID uint32, data models.Step) (*models.Step, error) {
	id, _ := shared_middleware.ParseContextUserModel(ctx)
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CreateStep")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	data.Creator = id
	data.StepGroup = stepGroupID

	if err := db.Create(&data).Save(&data).Error; err != nil {
		log.WithError(err).WithField("step", data).Error("Cant create step")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) GetSteps(ctx context.Context, caseID, stepGroupID uint32) ([]models.Step, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetSteps")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				if len(perm.Models) != 0 {
					for _, modelID := range perm.Models {
						if modelID == caseID {
							whereCondition = append(whereCondition, "step_group = ?")
							whereArguments = append(whereArguments, stepGroupID)
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
					whereArguments = append(whereArguments, 0)
				}
				continue
			} else {
				whereCondition = append(whereCondition, "step_group = ?")
				whereArguments = append(whereArguments, stepGroupID)
			}
		}
	}

	// Prepare conditions
	whereConditions := strings.Join(whereCondition, " AND ")
	if len(whereConditions) > 0 {
		whereConditions = fmt.Sprintf(" AND %s", whereConditions)
	}

	// Disable route if user has no related permissions
	if !canReadAllCases && !canReadSomeCases {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var stepData []models.Step
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	err = db.Raw(fmt.Sprintf(`
SELECT * FROM steps WHERE deleted_at IS NULL %s
ORDER BY created_at DESC, custom_order ASC`, whereConditions), whereArguments...).Scan(&stepData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return []models.Step{}, nil
		}

		log.WithError(err).Error("Cant get stepGroups")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	// Make user ids unique for handling in implementation
	return stepData, nil
}

// TODO: refactor with prev method
func (u *CasesRepository) GetStep(ctx context.Context, caseID, stepGroupID uint32, id uint32) (*models.Step, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	_, perms := shared_middleware.ParseContextUserModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("GetStep")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	// Declare default flags
	canReadAllCases := false
	canReadSomeCases := false

	// Declare default conditions and arguments for query
	whereCondition := make([]string, 0)
	whereArguments := make([]interface{}, 0)

	// Determining user permissions, setting flags, making conditions and arguments for query
	for _, perm := range perms {
		switch perm.Name {
		case "CanReadAllCases":
			// No need in other handling
			canReadAllCases = true
			continue
		case "CanReadSomeCases":
			canReadSomeCases = true
			// Available only if user has no canReadAllCases permission
			if !canReadAllCases {
				// Making condition for using with model ids from permission
				whereCondition = append(whereCondition, "id = ?")
				if len(perm.Models) != 0 {
					for _, i := range perm.Models {
						if i == caseID {
							whereArguments = append(whereArguments, id)
							break
						}
					}
				} else {
					// Setting default arguments for query if user CanReadSomeCases but has no models
					whereArguments = append(whereArguments, 0)
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
	if !canReadAllCases && !canReadSomeCases {
		return nil, errors.WithDetails(shared_errors.ErrForbidden, 403)
	}

	// Maybe map[string]string?
	var stepData []models.Step
	// Selecting cases and spaces, setting case.starred: true if this case has at least one starred space
	err = db.Raw(fmt.Sprintf(`
SELECT * FROM steps 
WHERE deleted_at IS NULL AND step_group = %d %s`, stepGroupID, whereConditions), whereArguments...).Scan(&stepData).Error

	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &models.Step{}, nil
		}

		log.WithError(err).Error("Cant get case")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if len(stepData) > 0 {
		return &stepData[0], nil
	}

	return &models.Step{}, nil
}

func (u *CasesRepository) EditStep(ctx context.Context, caseID, stepGroupID uint32, data models.Step, id uint32) (*models.Step, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("EditStep")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	if err := db.Model(models.Step{ID: id, StepGroup: stepGroupID}).Updates(data).Error; err != nil {
		log.WithError(err).WithField("step", data).Error("Cant edit step")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := db.Where(models.Step{ID: id}).First(&data).Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &data, nil
}

func (u *CasesRepository) DeleteStep(ctx context.Context, stepGroupID uint32, id uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("DeleteStep")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Delete(models.Step{ID: id, StepGroup: stepGroupID}).Error; err != nil {
		log.WithError(err).WithField("step", id).Error("Cant delete step")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (u *CasesRepository) CountCases(ctx context.Context, tenantID string, space []uint32) ([]*pb.CountBySpace, error) {
	log := u.log.TenantID(tenantID).WithReqID(ctx).Method("CountCases")

	db, err := u.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	var r = new([]*pb.CountBySpace)
	if err := db.Raw(`SELECT space, COUNT(id) FROM cases WHERE space IN (?) AND deleted_at IS NULL GROUP BY space`, space).Scan(&r).Error; err != nil {
		log.WithError(err).WithField("space", space).Error("Cant get cases count")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return *r, nil
}

func contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}
