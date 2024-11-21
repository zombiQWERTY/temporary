package projects_service

import (
	"bitbucket.org/ittinc/go-shared-packages/clients/postgres-client"
	"bitbucket.org/ittinc/go-shared-packages/migration-tool"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/tenants-service/model"
	"database/sql"
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
)

type ProjectsService struct {
	serviceDiscovery service_discovery.ServiceDiscovery
	cm               postgres_client.CallManager
	logger           *logrus.Entry
}

func NewProjectsService(serviceDiscovery service_discovery.ServiceDiscovery) *ProjectsService {
	return &ProjectsService{
		serviceDiscovery: serviceDiscovery,
	}
}

func (u *ProjectsService) StartCM(logger *logrus.Entry) (postgres_client.CallManager, error) {
	cm := postgres_client.NewCallManager(u.serviceDiscovery, logger, model.PROJECTS_POSTGRES_SERVICE_NAME, model.PROJECTS_POSTGRES_USER_KEY, model.PROJECTS_POSTGRES_PASSWORD_KEY, model.PROJECTS_POSTGRES_DATABASE_NAME_KEY)
	err := cm.Start()
	if err != nil {
		return nil, err
	}

	u.cm = cm
	u.logger = logger
	return cm, nil
}

func (u *ProjectsService) GetDB(dbName string) (*gorm.DB, error) {
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

func (u *ProjectsService) CreateDatabase(dbName string) (*gorm.DB, error) {
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

	if !res.Exists {
		err = u.serviceDiscovery.SaveValue(model.TENANTS_KEY+dbName, "")
		if err != nil {
			return nil, err
		}
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
