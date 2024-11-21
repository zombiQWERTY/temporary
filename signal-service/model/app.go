package model

import "time"

const APP_SERVICE_NAME = "signal_service"
const APP_SERVICE_NAME_HTTP = "signal_service_http"
const APP_SERVICE_NAME_GRPC = "signal_service_grpc"

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)

var ALLOWED_HOSTS = []string{ // TODO: Add real domains based on env
	"http://localhost:63342",
	"http://my-secure-dev-domain-53746uftwgjydshv25465.com:4200",
	"https://*.demo.doqa.ittest-team.ru",
	"https://*.doqa.io",
}
