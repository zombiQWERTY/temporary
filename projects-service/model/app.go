package model

import (
	"time"
)

const APP_SERVICE_NAME = "projects_service"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const TENANTS_KEY = "tenants/"

const (
	POSTGRES_SERVICE_NAME      = "postgres_projects_service"
	POSTGRES_USER_KEY          = "postgres_projects_service/user"
	POSTGRES_PASSWORD_KEY      = "postgres_projects_service/password"
	POSTGRES_DATABASE_NAME_KEY = "postgres_projects_service/default_db"
)
