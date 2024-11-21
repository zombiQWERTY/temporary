package model

import "time"

const APP_SERVICE_NAME = "tenants_service"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const (
	POSTGRES_SERVICE_NAME      = "postgres_tenants_service"
	POSTGRES_USER_KEY          = "postgres_tenants_service/user"
	POSTGRES_PASSWORD_KEY      = "postgres_tenants_service/password"
	POSTGRES_DATABASE_NAME_KEY = "postgres_tenants_service/default_db"
)

const TENANTS_KEY = "tenants/"

const (
	USERS_SERVICE_NAME               = "users_service"
	USERS_POSTGRES_SERVICE_NAME      = "postgres_users_service"
	USERS_POSTGRES_USER_KEY          = "postgres_users_service/user"
	USERS_POSTGRES_PASSWORD_KEY      = "postgres_users_service/password"
	USERS_POSTGRES_DATABASE_NAME_KEY = "postgres_users_service/default_db"
)

const (
	PROJECTS_SERVICE_NAME               = "projects_service"
	PROJECTS_POSTGRES_SERVICE_NAME      = "postgres_projects_service"
	PROJECTS_POSTGRES_USER_KEY          = "postgres_projects_service/user"
	PROJECTS_POSTGRES_PASSWORD_KEY      = "postgres_projects_service/password"
	PROJECTS_POSTGRES_DATABASE_NAME_KEY = "postgres_projects_service/default_db"
)

const (
	CASES_SERVICE_NAME               = "cases_service"
	CASES_POSTGRES_SERVICE_NAME      = "postgres_cases_service"
	CASES_POSTGRES_USER_KEY          = "postgres_cases_service/user"
	CASES_POSTGRES_PASSWORD_KEY      = "postgres_cases_service/password"
	CASES_POSTGRES_DATABASE_NAME_KEY = "postgres_cases_service/default_db"
)

const (
	DIRECTORIES_SERVICE_NAME               = "directory-service"
	DIRECTORIES_POSTGRES_SERVICE_NAME      = "postgres_directories_service"
	DIRECTORIES_POSTGRES_USER_KEY          = "postgres_directory_service/user"
	DIRECTORIES_POSTGRES_PASSWORD_KEY      = "postgres_directory_service/password"
	DIRECTORIES_POSTGRES_DATABASE_NAME_KEY = "postgres_directory_service/default_db"
)
