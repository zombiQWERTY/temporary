package tenants

import (
	"bitbucket.org/ittinc/tenants-service/models"
	"context"
)

type Repository interface {
	CreateTenant(ctx context.Context, name, domain string) (bool, error)
	GetCompanyInfo(ctx context.Context, tenantID string) (*models.CompanyData, error)
}
