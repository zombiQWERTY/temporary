package shared_errors

import (
	"emperror.dev/errors"
)

var (
	// Service communication errors
	ErrAuthDown    = errors.NewWithDetails("Auth down", "-1")
	ErrUsersDown   = errors.NewWithDetails("Users down", "-1")
	ErrTenantsDown = errors.NewWithDetails("Tenants down", "-1")
	ErrCasesDown   = errors.NewWithDetails("Cases down", "-1")
	//ErrMailerDown   = errors.NewWithDetails("Mailer down", "-1")
	ErrDatabaseDown = errors.NewWithDetails("Database down", "-1")

	// Common errors
	ErrSomethingWentWrong = errors.NewWithDetails("Something went wrong", "00000000")
	ErrValidationFailed   = errors.NewWithDetails("Validation failed", "00000001")
	ErrForbidden          = errors.NewWithDetails("Forbidden", "00000002")
	ErrOneProperty        = errors.NewWithDetails("Only one property allowed to this method", "00000003")

	// users-service errors
	ErrUserNotFound = errors.NewWithDetails("Username or password is incorrect", "00001001")
	//ErrUserBlocked        = errors.NewWithDetails("User blocked", "00001002")
	ErrUserEmailExists     = errors.NewWithDetails("User with current email already exists", "00001003")
	ErrInviteLinkNotFound  = errors.NewWithDetails("Invite token not found", "00001004")
	ErrCantRegister        = errors.NewWithDetails("Registration error", "00001005")
	ErrUserShortNameExists = errors.NewWithDetails("User with current short name already exists", "00001006")
	ErrMakeTokens          = errors.NewWithDetails("Can not make tokens", "00001007")
	ErrTokenExpired        = errors.NewWithDetails("Token expired", "00001008")
	ErrTokenInvalid        = errors.NewWithDetails("Token invalid", "00001009")

	ErrProjectExists = errors.NewWithDetails("Project exists", "00002001")
	ErrSpaceExists   = errors.NewWithDetails("Space exists", "00002002")

	ErrCaseExists = errors.NewWithDetails("Case exists", "00003001")
)
