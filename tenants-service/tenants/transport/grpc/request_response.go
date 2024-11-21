package grpc

import "bitbucket.org/ittinc/tenants-service/models"

type CreateTenantRequest struct {
	Name   string
	Domain string
}

type CreateTenantResponse struct {
	Success bool
}

type GetCompanyInfoRequest struct {
	TenantID string
}

type GetCompanyInfoResponse struct {
	models.CompanyData
}

//type Error struct {
//	Message    string            `json:"message"`
//	Code       int32             `json:"code"`
//	Validation map[string]string `json:"validation"`
//}
