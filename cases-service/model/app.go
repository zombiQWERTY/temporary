package model

import (
	"time"
)

const APP_SERVICE_NAME = "cases_service"
const APP_SERVICE_NAME_HTTP = "cases_service_http"
const APP_SERVICE_NAME_GRPC = "cases_service_grpc"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const TENANTS_KEY = "tenants/"

const (
	POSTGRES_SERVICE_NAME      = "postgres_cases_service"
	POSTGRES_USER_KEY          = "postgres_cases_service/user"
	POSTGRES_PASSWORD_KEY      = "postgres_cases_service/password"
	POSTGRES_DATABASE_NAME_KEY = "postgres_cases_service/default_db"
)
