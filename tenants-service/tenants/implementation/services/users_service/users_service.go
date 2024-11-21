package users_service

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/postgres-client"
	"bitbucket.org/ittinc/go-shared-packages/migration-tool"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	shared_errors "bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/tenants-service/model"
	"database/sql"
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"strings"
)

func MysqlRealEscapeString(value string) string {
	replace := map[string]string{"\\": "\\\\", "'": `\'`, "\\0": "\\\\0", "\n": "\\n", "\r": "\\r", `"`: `\"`, "\x1a": "\\Z"}

	for b, a := range replace {
		value = strings.Replace(value, b, a, -1)
	}

	return value
}

type UsersService struct {
	serviceDiscovery service_discovery.ServiceDiscovery
	cm               postgres_client.CallManager
	logger           *logrus.Entry
}

func NewUsersService(serviceDiscovery service_discovery.ServiceDiscovery) *UsersService {
	return &UsersService{
		serviceDiscovery: serviceDiscovery,
	}
}

func (u *UsersService) StartCM(logger *logrus.Entry) (postgres_client.CallManager, error) {
	cm := postgres_client.NewCallManager(u.serviceDiscovery, logger, model.USERS_POSTGRES_SERVICE_NAME, model.USERS_POSTGRES_USER_KEY, model.USERS_POSTGRES_PASSWORD_KEY, model.USERS_POSTGRES_DATABASE_NAME_KEY)
	err := cm.Start()
	if err != nil {
		return nil, err
	}

	u.cm = cm
	return cm, nil
}

func (u *UsersService) GetDB(dbName string) (*gorm.DB, error) {
	if u.cm == nil {
		return nil, errors.New("invalid methods calling order")
	}

	commands, err := u.cm.GetApiConnection()
	if err != nil {
		u.logger.WithField("error", err).Error("Cant get postgres call_manager api connection")
		return nil, err
	}

	db, err := commands.API(dbName)
	if err != nil {
		u.logger.WithField("error", err).Error("Failed to connect postgres database")
		return nil, err
	}

	if db == nil {
		u.logger.Error("Database not found")
		return nil, shared_errors.ErrDatabaseDown
	}

	return db, nil
}

func (u *UsersService) CreateDatabase(dbName string) (*gorm.DB, error) {
	db, err := u.GetDB("develop")
	if err != nil {
		return nil, err
	}

	type existsRes struct {
		Exists bool
	}

	var res existsRes
	err = db.Raw(fmt.Sprintf(`SELECT EXISTS(SELECT datname FROM pg_catalog.pg_database WHERE datname = '%s');`, dbName)).Scan(&res).Error
	if err != nil {
		return nil, err
	}

	if !res.Exists {
		err = db.Exec(fmt.Sprintf("CREATE DATABASE %s;", dbName)).Error
		if err != nil {
			return nil, err
		}
	}

	db, err = u.GetDB(dbName)
	if err != nil {
		return nil, err
	}

	err = u.serviceDiscovery.SaveValue(model.TENANTS_KEY+dbName, "")
	if err != nil {
		return nil, err
	}

	return db, nil
}

type Service struct {
	ServiceName  string
	DatabaseType string
	DBName       string
	Dev          bool
}

func Migrate(db *sql.DB, service Service) error {
	return migration_tool.MigrateUP(db, service.ServiceName, service.DatabaseType, service.DBName, service.Dev)
}
