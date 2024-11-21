package repository

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/tenants-service/models"
	"bitbucket.org/ittinc/tenants-service/tenants"
	"context"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
	"strings"
)

type TenantsRepository struct {
	postgresConnect func(logger *logrus.Entry) (client *gorm.DB, e error)
	log             *logger.Logger
}

func NewTenantsRepository(postgresConnect func(logger *logrus.Entry) (client *gorm.DB, e error), log *logrus.Entry) tenants.Repository {
	return &TenantsRepository{
		postgresConnect: postgresConnect,
		log:             logger.UseLogger(log),
	}
}

func (r *TenantsRepository) CreateTenant(ctx context.Context, name, domain string) (bool, error) {
	log := r.log.TenantID(domain).Method("CreateTenant")

	// TODO: validations
	db, err := r.postgresConnect(log.Logger)
	if err != nil {
		log.DatabaseDownError(err)
		return false, nil
	}

	tenant := models.Tenant{
		Name:   name,
		Domain: domain,
	}

	if err := db.Create(&tenant).Save(&tenant).Error; err != nil {
		if !(strings.Contains(err.Error(), "duplicate key") && strings.Contains(err.Error(), "tenants_name_key")) {
			return false, err
		}
	}

	return true, err
}

func (r *TenantsRepository) GetCompanyInfo(ctx context.Context, tenantID string) (*models.CompanyData, error) {
	log := r.log.TenantID(tenantID).Method("GetCompanyInfo")

	db, err := r.postgresConnect(log.Logger)
	if err != nil {
		log.DatabaseDownError(err)
		return nil, err
	}

	tenant := models.Tenant{}
	if err := db.Where(&models.Tenant{Domain: tenantID}).First(&tenant).Error; err != nil {
		return nil, err
	}

	return &models.CompanyData{Name: tenant.Name}, nil
}
