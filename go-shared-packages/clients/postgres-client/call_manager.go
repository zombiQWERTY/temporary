package postgres_client

import (
	"bitbucket.org/ittinc/go-shared-packages/clients"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery/connections_pool"
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/sirupsen/logrus"
	"sync"
)

type CallManager interface {
	GetApiConnection() (CallCommands, error)
	GetApiConnectionById(id string) (CallCommands, error)
	Start() error
	Stop()
}

type CallManagerImpl struct {
	logger             *logrus.Entry
	serviceName        string
	serviceUserKey     string
	servicePasswordKey string
	serviceDBKey       string
	serviceDiscovery   service_discovery.ServiceDiscovery
	poolConnections    connections_pool.Pool

	stop      chan struct{}
	stopped   chan struct{}
	watcher   *clients.Watcher
	startOnce sync.Once
}

func NewCallManager(serviceDiscovery service_discovery.ServiceDiscovery, logger *logrus.Entry, serviceName, serviceUserKey, servicePasswordKey, serviceDBKey string) CallManager {
	log := logger.WithField("serviceName", serviceName)

	return &CallManagerImpl{
		logger:             log,
		serviceName:        serviceName,
		serviceUserKey:     serviceUserKey,
		servicePasswordKey: servicePasswordKey,
		serviceDBKey:       serviceDBKey,
		poolConnections:    connections_pool.NewPoolConnections(log),
		serviceDiscovery:   serviceDiscovery,
		stop:               make(chan struct{}),
		stopped:            make(chan struct{}),
	}
}

func (cm *CallManagerImpl) Start() error {
	cm.logger.Debug("Starting call_manager service")

	services, err := cm.serviceDiscovery.GetByName(cm.serviceName) // Ex.: POSTGRES_AUTH_SERVICE
	if err != nil {
		return err
	}

	if len(services) == 0 {
		return errors.New("empty services pool")
	}

	for _, v := range services {
		cm.registerConnection(v)
	}

	cm.startOnce.Do(func() {
		cm.watcher = clients.MakeWatcher(fmt.Sprintf("call_manager %s", cm.serviceName), clients.WATCHER_INTERVAL, cm.wakeUp, cm.logger)
		go cm.watcher.Start()
		go func() {
			defer func() {
				cm.Stop()
				cm.logger.Debug("Stopped call_manager")
				close(cm.stopped)
			}()

			for {
				select {
				case <-cm.stop:
					cm.logger.Debug("call_manager received stop signal")
					return
				}
			}
		}()
	})

	return nil
}

func (cm *CallManagerImpl) Stop() {
	cm.logger.Debug("call_manager stopping")

	if cm.poolConnections != nil {
		cm.poolConnections.CloseAllConnections()
	}

	close(cm.stop)
	<-cm.stopped
}

func (cm *CallManagerImpl) GetClient(tenantID string) (*gorm.DB, error) {
	api, err := cm.GetApiConnection()
	if err != nil {
		return nil, err
	}

	return api.API(tenantID)
}

func (cm *CallManagerImpl) registerConnection(v *connections_pool.ServiceConnection) {
	// TODO: vault
	user := cm.serviceDiscovery.GetValueByKey(cm.serviceUserKey)
	password := cm.serviceDiscovery.GetValueByKey(cm.servicePasswordKey)
	db := cm.serviceDiscovery.GetValueByKey(cm.serviceDBKey)

	logger := cm.logger.WithField("serviceInfo", v)

	if user == nil || password == nil || db == nil {
		logger.Error("Cant get credentials")
		return
	}

	client, err := NewCallConnection(v.Id, *user, *password, v.Host, v.Port, *db)
	if err != nil {
		logger.WithField("error", err).Error("Cant get credentials")
		return
	}

	cm.poolConnections.Append(client)
	logger.WithFields(logrus.Fields{
		"name": client.name,
		"host": client.host,
	}).Debug("Register connection")
}

func (cm *CallManagerImpl) GetApiConnection() (CallCommands, error) {
	conn, err := cm.poolConnections.Get(connections_pool.StrategyRoundRobin)
	if err != nil {
		return nil, err
	}

	return conn.(CallCommands), nil
}

func (cm *CallManagerImpl) GetApiConnectionById(id string) (CallCommands, error) {
	conn, err := cm.poolConnections.GetById(id)
	if err != nil {
		return nil, err
	}

	return conn.(CallCommands), nil
}

func (cm *CallManagerImpl) wakeUp() {
	list, err := cm.serviceDiscovery.GetByName(cm.serviceName)
	if err != nil {
		cm.logger.WithField("error", err).Error("Cant get service")
		return
	}

	for _, v := range list {
		if _, err := cm.poolConnections.GetById(v.Id); err == connections_pool.ErrNotFoundConnection {
			cm.registerConnection(v)
		}
	}

	cm.poolConnections.RecheckConnections()
}
