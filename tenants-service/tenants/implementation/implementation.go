package implementation

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/tokens-manager"
	"bitbucket.org/ittinc/tenants-service/model"
	"bitbucket.org/ittinc/tenants-service/models"
	"bitbucket.org/ittinc/tenants-service/tenants"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/cases_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/directories_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/projects_service"
	"bitbucket.org/ittinc/tenants-service/tenants/implementation/services/users_service"
	"context"
	"errors"
	"fmt"
	"github.com/sirupsen/logrus"
	"strings"
)

func contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}

type TenantsImpl struct {
	dev              bool
	tenantsRepo      tenants.Repository
	serviceDiscovery service_discovery.ServiceDiscovery
	log              *logger.Logger
}

func NewTenantsImpl(tenantsRepo tenants.Repository, serviceDiscovery service_discovery.ServiceDiscovery, log *logrus.Entry, dev bool) tenants.Implementation {
	return &TenantsImpl{
		dev:              dev,
		tenantsRepo:      tenantsRepo,
		serviceDiscovery: serviceDiscovery,
		log:              logger.UseLogger(log),
	}
}

func (t *TenantsImpl) CreateTenant(ctx context.Context, name, domain string) (bool, error) {
	log := t.log.Method("CreateTenant")

	// TODO: Revert if error
	dbName := strings.Trim(domain, "")
	dbName = users_service.MysqlRealEscapeString(domain)

	if contains(model.DomainsBlacklist, dbName) {
		return false, errors.New("unavailable domain name")
	}

	success, err := t.tenantsRepo.CreateTenant(ctx, name, dbName)
	if err != nil {
		return false, err
	}

	if !success {
		return false, nil
	}

	{
		{
			users := users_service.NewUsersService(t.serviceDiscovery)
			_, err := users.StartCM(log.Logger)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant prepare database")
				return false, err
			}

			db, err := users.CreateDatabase(dbName)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant create database or save value to consul")
				return false, err
			}

			service := users_service.Service{
				ServiceName:  model.USERS_SERVICE_NAME,
				DatabaseType: "postgres",
				DBName:       dbName,
				Dev:          t.dev,
			}

			err = users_service.Migrate(db.DB(), service)
			if err != nil {
				if err.Error() != "no change" {
					log.TenantID(name).WithError(err).Error("Cant migrate database")
					return false, err
				}
			}

			if !success {
				log.TenantID(name).WithError(err).Error("Error preparing users_service")
				return false, nil
			}
		}

		{
			projects := projects_service.NewProjectsService(t.serviceDiscovery)
			_, err := projects.StartCM(log.Logger)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant prepare database")
				return false, err
			}

			db, err := projects.CreateDatabase(dbName)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant create database or save value to consul")
				return false, err
			}

			service := projects_service.Service{
				ServiceName:  model.PROJECTS_SERVICE_NAME,
				DatabaseType: "postgres",
				DBName:       dbName,
				Dev:          t.dev,
			}

			err = projects_service.Migrate(db.DB(), service)
			if err != nil {
				if err.Error() != "no change" {
					log.TenantID(name).WithError(err).Error("Cant migrate database")
					return false, err
				}
			}

			if !success {
				log.TenantID(name).WithError(err).Error("Error preparing projects_service")
				return false, nil
			}
		}

		{
			cases := cases_service.NewCasesService(t.serviceDiscovery)
			_, err := cases.StartCM(log.Logger)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant prepare database")
				return false, err
			}

			db, err := cases.CreateDatabase(dbName)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant create database or save value to consul")
				return false, err
			}

			service := cases_service.Service{
				ServiceName:  model.CASES_SERVICE_NAME,
				DatabaseType: "postgres",
				DBName:       dbName,
				Dev:          t.dev,
			}

			err = cases_service.Migrate(db.DB(), service)
			if err != nil {
				if err.Error() != "no change" {
					log.TenantID(name).WithError(err).Error("Cant migrate database")
					return false, err
				}
			}

			if !success {
				log.TenantID(name).WithError(err).Error("Error preparing cases_service")
				return false, nil
			}
		}

		{
			directories := directories_service.NewDirectoriesService(t.serviceDiscovery)
			_, err := directories.StartCM(log.Logger)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant prepare database")
				return false, err
			}

			db, err := directories.CreateDatabase(dbName)
			if err != nil {
				log.TenantID(name).WithError(err).Error("Cant create database or save value to consul")
				return false, err
			}

			service := directories_service.Service{
				ServiceName:  model.DIRECTORIES_SERVICE_NAME,
				DatabaseType: "postgres",
				DBName:       dbName,
				Dev:          t.dev,
			}

			err = directories_service.Migrate(db.DB(), service)
			if err != nil {
				if err.Error() != "no change" {
					log.TenantID(name).WithError(err).Error("Cant migrate database")
					return false, err
				}
			}

			if !success {
				log.TenantID(name).WithError(err).Error("Error preparing directories_service")
				return false, nil
			}
		}
	}

	var headers = make(map[string]string, 1)
	headers["tenant"] = dbName
	bytes, err := tokens_manager.EncodeData(headers)
	if err != nil {
		log.TenantID(name).WithError(err).Error("Cant generate rsa private key")
		return false, err
	}

	key := fmt.Sprintf("%s%s/privateKey", model.TENANTS_KEY, dbName) // /tenants/:tenant/privateKey
	err = t.serviceDiscovery.SaveValue(key, string(bytes))
	if err != nil {
		log.TenantID(name).WithError(err).WithField("privateKey", string(bytes)).Error("Cant save rsa private key to consul")
		return false, err
	}

	return true, nil
}

func (t *TenantsImpl) GetCompanyInfo(ctx context.Context, tenantID string) (*models.CompanyData, error) {
	return t.tenantsRepo.GetCompanyInfo(ctx, tenantID)
}
