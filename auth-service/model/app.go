package model

import "time"

const APP_SERVICE_NAME = "auth_service"
const APP_SERVICE_NAME_HTTP = "auth_service_http"
const APP_SERVICE_NAME_GRPC = "auth_service_grpc"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const TENANTS_KEY = "tenants/"

const (
	REDIS_SERVICE_NAME = "redis_auth_service"
	REDIS_PASSWORD_KEY = "redis_auth_service/password"
	REDIS_DB_KEY       = "redis_auth_service/db"
)
