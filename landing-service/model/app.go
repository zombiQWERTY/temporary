package model

import (
	"time"
)

const APP_SERVICE_NAME = "landing_service"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

const TENANTS_KEY = "tenants/"

const (
	MONGO_SERVICE_NAME = "mongo_landing_service"
)
