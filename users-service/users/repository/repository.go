package repository

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/users-service/models"
	"bitbucket.org/ittinc/users-service/users"
	"context"
	"emperror.dev/errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"strings"
	"time"
)

type UsersRepository struct {
	postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error)
	log             *logger.Logger
}

func NewUsersRepository(postgresConnect func(tenantID string, logger *logrus.Entry) (*gorm.DB, error), log *logrus.Entry) users.Repository {
	return &UsersRepository{
		postgresConnect: postgresConnect,
		log:             logger.UseLogger(log),
	}
}

func (r *UsersRepository) Register(ctx context.Context, data models.User, id uint32) (*models.User, error) {
	return r.PatchUser(ctx, data, id)
}

func (r *UsersRepository) Login(ctx context.Context, credentials models.Login) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("Login")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	u := &models.User{}
	err = db.Where(models.User{Email: credentials.Email}).First(u).Error
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return nil, errors.Append(shared_errors.ErrUserNotFound, err)
		}

		log.WithError(err).WithField("userEmail", credentials.Email).Error("Cant find user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return u, nil
}

func (r *UsersRepository) RefreshToken(ctx context.Context, data models.RefreshToken, ID uint32) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("RefreshToken")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	u := &models.User{}
	err = db.Where(models.User{BaseModel: models.BaseModel{ID: ID}}).First(u).Error
	if err != nil {
		log.WithError(err).WithField("refreshToken", data.RefreshToken).Error("Cant find user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	} else if gorm.IsRecordNotFoundError(err) {
		return nil, errors.Append(shared_errors.ErrUserNotFound, err)
	}

	return u, nil
}

func (r *UsersRepository) Logout(ctx context.Context, data models.Logout) error {
	return nil
}

func (r *UsersRepository) GetUser(ctx context.Context, id uint32) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("GetUser")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	u := &models.User{}
	err = db.Where(models.User{BaseModel: models.BaseModel{ID: id}}).First(u).Error
	if err != nil {
		log.User(id).WithError(err).Error("Cant find user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	} else if gorm.IsRecordNotFoundError(err) {
		return nil, errors.Append(shared_errors.ErrUserNotFound, err)
	}

	if u.ID == 1 { // User with ID == 1 is our customer
		u.Owner = true
	}

	return u, nil
}

func (r *UsersRepository) GetAllUsers(ctx context.Context) ([]models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("GetAllUsers")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	var u []models.User
	err = db.Find(&u).Error
	if err != nil {
		log.WithError(err).Error("Cant find all users")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	} else if gorm.IsRecordNotFoundError(err) {
		return []models.User{}, nil
	}

	return u, nil
}

func (r *UsersRepository) GetUsersByID(ctx context.Context, IDs []uint32) ([]models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("GetUsersByID")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	var u []models.User
	err = db.Model(&models.User{}).Where("id IN (?)", IDs).Find(&u).Error
	if err != nil {
		log.WithError(err).WithField("ids", IDs).Error("Cant find users by id")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	} else if gorm.IsRecordNotFoundError(err) {
		return []models.User{}, nil
	}

	return u, nil
}

func (r *UsersRepository) PatchUser(ctx context.Context, data interface{}, id uint32) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("PatchUser")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	if err := db.Model(models.User{BaseModel: models.BaseModel{ID: id}}).Updates(data).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "users_short_name_key") {
				return nil, errors.Append(shared_errors.ErrUserShortNameExists, err)
			}
		}

		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	u := &models.User{}
	err = db.Where(models.User{BaseModel: models.BaseModel{ID: id}}).First(u).Error
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return nil, errors.Append(shared_errors.ErrUserNotFound, err)
		}
		log.User(id).WithError(err).WithField("data", data).Error("Cant find user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return u, nil
}

func (r *UsersRepository) InviteUser(ctx context.Context, user models.User, permissions []shared_middleware.PermissionList) (*models.User, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("InviteUser")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	tx := db.Begin()
	if err := tx.Create(&user).Save(&user).Error; err != nil {
		tx.Rollback()
		if strings.Contains(err.Error(), "duplicate key") {
			if strings.Contains(err.Error(), "email") || strings.Contains(err.Error(), "users_short_name_key") {
				return nil, errors.Append(shared_errors.ErrUserEmailExists, err)
			}
		}

		log.User(user).WithError(err).Error("Cant invite user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if err := r.addPermissions(ctx, tx, log, user.ID, permissions, false); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return &user, nil
}

func (r *UsersRepository) addPermissions(ctx context.Context, tx *gorm.DB, log *logger.Logger, userID uint32, permissions []shared_middleware.PermissionList, correlateWithIssuer bool) error {
	if len(permissions) == 0 && !correlateWithIssuer {
		return nil
	}

	smt := `DELETE FROM user_has_permissions WHERE user_id = ?;`

	if err := tx.Unscoped().Exec(smt, userID).Error; err != nil {
		tx.Rollback()
		log.User(userID).WithError(err).WithField("permissions", permissions).Error("Cant remove old permissions")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	if len(permissions) == 0 {
		return nil
	}

	var perms []*models.UserHasPermissions
	for _, p := range permissions {
		isMultiplePerm := false

		if correlateWithIssuer {
			essenceType := strings.Split(p.Essence, ":")[0]

			if essenceType == "multiple" || (essenceType == "grant" && len(p.Models) != 0) {
				isMultiplePerm = true
			}
		} else {
			isMultiplePerm = len(p.Models) != 0
		}

		if len(p.Models) != 0 && isMultiplePerm {
			for i, _ := range p.Models {
				perms = append(perms, &models.UserHasPermissions{
					UserID:       userID,
					PermissionID: p.ID,
					ModelID:      &p.Models[i],
				})
			}
		} else {
			if !isMultiplePerm {
				perms = append(perms, &models.UserHasPermissions{
					UserID:       userID,
					PermissionID: p.ID,
				})
			}
		}
	}

	var valueStrings []string
	var valueArgs []interface{}

	for _, p := range perms {
		valueStrings = append(valueStrings, "(?, ?, ?)")

		valueArgs = append(valueArgs, &p.PermissionID)
		valueArgs = append(valueArgs, &p.UserID)
		valueArgs = append(valueArgs, p.ModelID)
	}

	smt = `INSERT INTO user_has_permissions(permission_id, user_id, model_id) VALUES %s`
	smt = fmt.Sprintf(smt, strings.Join(valueStrings, ","))

	if err := tx.Exec(smt, valueArgs...).Error; err != nil {
		tx.Rollback()
		log.User(userID).WithError(err).WithField("permissions", permissions).Error("Cant set perms for user, rollback")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (r *UsersRepository) CheckUserMetaExists(ctx context.Context, data models.CheckUserMetaExistsRequest) (*bool, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("CheckUserMetaExists")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	res := false
	var u models.User
	if err := db.Where(models.User{Email: data.Email, ShortName: data.ShortName}).First(&u).Error; err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &res, nil
		}

		log.WithError(err).WithField("data", data).Error("Cant get user")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	res = true
	return &res, nil
}

func (r *UsersRepository) GetUserListPermissions(ctx context.Context, ids []uint32) ([]shared_middleware.PermissionList, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("GetUserListPermissions")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	var userHasPermissions []models.UserHasPermissions
	err = db.Raw(`
SELECT DISTINCT uhp.permission_id,
                uhp.user_id,
                uhp.model_id,
                permissions.name,
                permissions.essence
FROM   permissions
           left join user_has_permissions uhp
                     ON permissions.id = uhp.permission_id
WHERE  uhp.user_id IN (?)
ORDER BY uhp.permission_id
`, ids).Scan(&userHasPermissions).Error
	if err != nil {
		log.WithError(err).WithField("ids", ids).Error("Cant get users permissions")
		return nil, err
	}

	isPermExists := func(id, userID uint32, perms []shared_middleware.PermissionList) (index int, result bool) {
		result = false
		index = 0
		for i, p := range perms {
			if p.ID == id && p.UserID == userID {
				result = true
				index = i
				break
			}
		}
		return index, result
	}

	res := make([]shared_middleware.PermissionList, 0)
	for _, p := range userHasPermissions {
		index, exists := isPermExists(p.PermissionID, p.UserID, res)
		if exists {
			if p.ModelID != nil {
				res[index].Models = append(res[index].Models, *p.ModelID)
			}
		} else {
			tempPerm := shared_middleware.PermissionList{
				ID:      p.PermissionID,
				UserID:  p.UserID,
				Name:    p.Name,
				Essence: p.Essence,
			}

			if p.ModelID != nil {
				tempPerm.Models = []uint32{*p.ModelID}
			}

			res = append(res, tempPerm)
		}
	}

	return res, nil
}

func (r *UsersRepository) GetMyPermissions(ctx context.Context, id uint32) ([]shared_middleware.PermissionList, error) {
	return r.GetUserListPermissions(ctx, []uint32{id})
}

func (r *UsersRepository) EditPermissions(ctx context.Context, userID uint32, permissions []shared_middleware.PermissionList, correlateWithIssuer bool) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("EditPermissions")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	tx := db.Begin()
	if err := r.addPermissions(ctx, tx, log, userID, permissions, correlateWithIssuer); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (r *UsersRepository) GetAllPermissions(ctx context.Context) ([]models.Permission, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("GetAllPermissions")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return nil, shared_errors.ErrDatabaseDown
	}

	var p []models.Permission
	err = db.Find(&p).Error
	if err != nil {
		log.WithError(err).Error("Cant get all permissions")
		return nil, errors.Append(shared_errors.ErrSomethingWentWrong, err)
	} else if gorm.IsRecordNotFoundError(err) {
		return []models.Permission{}, nil
	}

	return p, nil
}

func (r *UsersRepository) MultipleUsersDelete(ctx context.Context, users []uint32) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("MultipleUsersDelete")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	if err := db.Exec("UPDATE users SET status = 'removed', email = email || '_' || ? WHERE id IN (?)", time.Now().Unix(), users).Where("id IN (?)", users).Delete(models.User{}).Error; err != nil {
		log.WithError(err).Error("Cant delete users")
		return errors.Append(shared_errors.ErrSomethingWentWrong, err)
	}

	return nil
}

func (r *UsersRepository) MultipleUsersToggleBlock(ctx context.Context, users []uint32, block bool) error {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("MultipleUsersToggleBlock")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return shared_errors.ErrDatabaseDown
	}

	blockStatus := models.UserBlocked
	selectStatus := models.UserActive
	if !block {
		blockStatus = models.UserActive
		selectStatus = models.UserBlocked
	}

	err = db.Model(&models.User{}).Where("id IN (?) AND status = ?", users, selectStatus).Update(models.User{Status: blockStatus}).Error
	if err != nil {
		log.WithError(err).Error("Cant toggle block users")
		return err
	}

	return nil
}

func (r *UsersRepository) CheckAccess(ctx context.Context, permName string, userID uint32, modelIDs []uint32) (models.CheckAccessResponse, error) {
	tenantID := shared_middleware.ParseContextTenantModel(ctx)
	log := r.log.TenantID(tenantID).WithReqID(ctx).Method("CheckAccess")

	db, err := r.postgresConnect(tenantID, log.Logger)
	if err != nil {
		return models.CheckAccessResponse{Access: nil}, shared_errors.ErrDatabaseDown
	}

	type ExtendedUserHasPermissions struct {
		Id      uint32
		Name    string
		ModelId uint32
		UserId  uint32
	}

	modelIDCondition := ""
	if len(modelIDs) > 0 {
		var args []string
		for _, id := range modelIDs {
			args = append(args, string(id))
		}

		modelIDCondition = fmt.Sprintf("AND uhp.model_id IN (%s)", strings.Join(args, ","))
	}

	var perms []ExtendedUserHasPermissions
	err = db.Raw(fmt.Sprintf(`
SELECT permissions.id,
       permissions.name,
       uhp.model_id AS model_id,
       uhp.user_id AS user_id
FROM   permissions
           LEFT JOIN user_has_permissions uhp
                     ON permissions.id = uhp.permission_id
WHERE permissions.name = ? AND uhp.user_id = ? %s`, modelIDCondition), permName, userID).Scan(&perms).Error

	if err != nil {
		log.WithError(err).Error("Cant get permissions info")
		return models.CheckAccessResponse{Access: []models.AccessByModelID{}}, shared_errors.ErrDatabaseDown
	}

	if len(perms) == 0 {
		return models.CheckAccessResponse{Access: []models.AccessByModelID{}}, nil
	}

	res := models.CheckAccessResponse{Access: []models.AccessByModelID{}}
	for _, p := range perms {
		res.Access = append(res.Access, models.AccessByModelID{
			HasAccess: true,
			ModelID:   p.ModelId,
		})
	}

	if len(res.Access) != len(modelIDs) {
		for _, m := range modelIDs {
			ids := make([]uint32, 0)
			for _, r := range res.Access {
				ids = append(ids, r.ModelID)
			}

			if !containsUint32(ids, m) {
				res.Access = append(res.Access, models.AccessByModelID{HasAccess: false, ModelID: m})
			}
		}
	}

	return res, nil
}

func containsUint32(slice []uint32, item uint32) bool {
	set := make(map[uint32]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}
