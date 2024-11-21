package service_discovery

import (
	"bitbucket.org/ittinc/go-shared-packages/service-discovery/connections_pool"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery/consul"
	"github.com/sirupsen/logrus"
	"time"
)

func NewConsulDiscovery(id, addr string, check consul.CheckFunction, registerService bool, logger *logrus.Entry) (ServiceDiscovery, error) {
	return consul.NewConsul(id, addr, check, registerService, logger)
}

type ServiceDiscovery interface {
	RegisterService(name string, pubHost string, pubPort int, ttl, criticalTtl time.Duration) error
	Shutdown()
	GetByName(serviceName string) ([]*connections_pool.ServiceConnection, error)
	GetValueByKey(key string) *string
	GetKeyList(key string) []string
	SaveValue(key, value string) error
}
