package model

import (
	"time"
)

const APP_SERVICE_NAME = "users_service_http"
const APP_SERVICE_NAME_GRPC = "users_service_grpc"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const (
	REDIS_SERVICE_NAME = "redis_users_service"
	REDIS_PASSWORD_KEY = "redis_users_service/password"
	REDIS_DB_KEY       = "redis_users_service/db"
)

const TENANTS_KEY = "tenants/"
const BIG_CACHE_EVICTION_KEY = "users_service/big_cache_eviction"

const (
	POSTGRES_SERVICE_NAME      = "postgres_users_service"
	POSTGRES_USER_KEY          = "postgres_users_service/user"
	POSTGRES_PASSWORD_KEY      = "postgres_users_service/password"
	POSTGRES_DATABASE_NAME_KEY = "postgres_users_service/default_db"
)

const (
	ACCESS_TOKEN_EXPIRES  = 2
	REFRESH_TOKEN_EXPIRES = 24 * 30
)
