package landing

import (
	"bitbucket.org/ittinc/landing-service/models"
	"context"
)

type Implementation interface {
	CreateCompany(ctx context.Context, data models.CompanyCreateRequest) error
}
