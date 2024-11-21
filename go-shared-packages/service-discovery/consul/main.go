package consul

import (
	"bitbucket.org/ittinc/go-shared-packages/service-discovery/connections_pool"
	"fmt"
	"github.com/hashicorp/consul/api"
	"github.com/sirupsen/logrus"
	"time"
)

type consul struct {
	logger          *logrus.Entry
	id              string
	client          *api.Client
	kv              *api.KV
	agent           *api.Agent
	stop            chan struct{}
	check           CheckFunction
	checkId         string
	registerService bool
}

type CheckFunction func() (bool, error)

func NewConsul(id, addr string, check CheckFunction, registerService bool, logger *logrus.Entry) (*consul, error) {
	conf := api.DefaultConfig()
	conf.Address = addr

	client, err := api.NewClient(conf)

	if err != nil {
		return nil, err
	}

	c := &consul{
		logger:          logger,
		id:              id,
		registerService: registerService,
		client:          client,
		agent:           client.Agent(),
		stop:            make(chan struct{}),
		check:           check,
		kv:              client.KV(),
	}

	return c, nil
}

func (c *consul) GetByName(serviceName string) ([]*connections_pool.ServiceConnection, error) {
	list, err := c.agent.ServicesWithFilter(fmt.Sprintf("Service == %s", serviceName))
	if err != nil {
		return nil, err
	}

	result := make([]*connections_pool.ServiceConnection, 0, len(list))
	for _, v := range list {
		result = append(result, &connections_pool.ServiceConnection{
			Id:      v.ID,
			Service: v.Service,
			Host:    v.Address,
			Port:    v.Port,
		})
	}

	return result, nil
}

func (c *consul) RegisterService(name string, pubHost string, pubPort int, ttl, criticalTtl time.Duration) error {
	if !c.registerService {
		return nil
	}

	var err error

	as := &api.AgentServiceRegistration{
		Name:    name,
		ID:      c.id,
		Tags:    []string{c.id},
		Address: pubHost,
		Port:    pubPort,
		Check: &api.AgentServiceCheck{
			DeregisterCriticalServiceAfter: criticalTtl.String(),
			TTL:                            ttl.String(),
		},
	}

	if err = c.agent.ServiceRegister(as); err != nil {
		return err
	}

	var checks map[string]*api.AgentCheck
	if checks, err = c.agent.Checks(); err != nil {
		return err
	}

	var serviceCheck *api.AgentCheck
	for _, check := range checks {
		if check.ServiceID == c.id {
			serviceCheck = check
		}
	}

	if serviceCheck == nil {
		return err
	}
	c.checkId = serviceCheck.CheckID
	c.update()

	c.logger.Debug("started consul service")

	go c.updateTTL(ttl / 2)

	return nil
}

func (c *consul) update() {
	ok, err := c.check()
	if !ok {
		message := ""
		if err != nil {
			c.logger.Error("Cant update service", err)
			message = err.Error()
		}

		if agentErr := c.agent.FailTTL(c.checkId, message); agentErr != nil {
			c.logger.Error("Cant update service, FailTTL", agentErr)
		}
	} else {
		if agentErr := c.agent.PassTTL(c.checkId, "ready..."); agentErr != nil {
			c.logger.Error("Cant update service, PassTTL", agentErr)
		}
	}
}

func (c *consul) updateTTL(ttl time.Duration) {
	defer c.logger.Error("stopped consul checker")

	ticker := time.NewTicker(ttl / 2)
	for {
		select {
		case <-c.stop:
			return
		case <-ticker.C:
			c.update()
		}
	}
}

func (c *consul) Shutdown() {
	close(c.stop)
	_ = c.agent.ServiceDeregister(c.id)
}

func (c *consul) GetValueByKey(key string) *string {
	kvp, _, _ := c.kv.Get(key, nil)
	if kvp != nil {
		res := string(kvp.Value)
		return &res
	}

	return nil
}

func (c *consul) GetKeyList(prefix string) []string {
	kvp, _, _ := c.kv.Keys(prefix, "", nil)
	return kvp
}

func (c *consul) SaveValue(key, value string) error {
	_, err := c.kv.Put(&api.KVPair{Key: key, Value: []byte(value)}, nil)
	return err
}
