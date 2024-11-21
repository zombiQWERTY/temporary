package implementation

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/shared-errors"
	"bitbucket.org/ittinc/landing-service/landing"
	"bitbucket.org/ittinc/landing-service/models"
	tenantsPB "bitbucket.org/ittinc/tenants-service/tenants_grpc/pb"
	usersPB "bitbucket.org/ittinc/users-service/users_grpc/pb"
	"context"
	"github.com/sirupsen/logrus"
)

type UsersImpl struct {
	consulService service_discovery.ServiceDiscovery
	usersClient   func() (usersPB.UsersServiceClient, error)
	tenantsClient func() (tenantsPB.TenantsServiceClient, error)
	log           *logger.Logger
}

func NewUsersImpl(consulService service_discovery.ServiceDiscovery, log *logrus.Entry, usersClient func() (usersPB.UsersServiceClient, error), tenantsClient func() (tenantsPB.TenantsServiceClient, error)) landing.Implementation {
	return &UsersImpl{
		consulService: consulService,
		usersClient:   usersClient,
		tenantsClient: tenantsClient,
		log:           logger.UseLogger(log),
	}
}

func (u *UsersImpl) CreateCompany(ctx context.Context, data models.CompanyCreateRequest) error {
	log := u.log.WithReqID(ctx).Method("CreateCompany")

	tenantsClient, err := u.tenantsClient()
	if err != nil {
		log.TenantsDownError(err)
		return shared_errors.ErrTenantsDown
	}

	_, err = tenantsClient.CreateTenant(context.Background(), &tenantsPB.CreateTenantRequest{
		Name:   data.Company.Name,
		Domain: data.Company.Name, // TODO: do smth?
	})

	if err != nil {
		log.TenantsDownError(err)
		return shared_errors.ErrTenantsDown
	}

	user := usersPB.CreateOwnerRequest{
		Email:     data.User.Email,
		FirstName: data.User.FirstName,
		LastName:  data.User.LastName,
		Password:  data.User.Password,
		TenantID:  data.Company.Name,
	}

	usersClient, err := u.usersClient()
	if err != nil {
		log.UsersDownError(err)
		return shared_errors.ErrUsersDown
	}

	_, err = usersClient.CreateOwner(context.Background(), &user)
	if err != nil {
		log.UsersDownError(err)
		return shared_errors.ErrUsersDown
	}

	return nil
}
