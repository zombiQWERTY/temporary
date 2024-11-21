package http

import (
	"bitbucket.org/ittinc/landing-service/models"
)

type CreateCompanyRequest struct {
	models.CompanyCreateRequest `valid:"optional"`
}

type CreateCompanyResponse struct {
	Success bool `json:"success"`
}
