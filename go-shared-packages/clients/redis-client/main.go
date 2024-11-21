package redis_client

import (
	"github.com/go-redis/redis/v7"
)

type CallConnection struct {
	name   string
	host   string
	client *redis.Client
}

func NewCallConnection(name, url string, password string, db int) (*CallConnection, error) {
	c := &CallConnection{
		name: name,
		host: url,
	}

	c.client = redis.NewClient(&redis.Options{
		Addr:     url,
		Password: password,
		DB:       db,
	})

	return c, nil
}

func (c *CallConnection) Ready() bool {
	_, err := c.client.Ping().Result()
	if err != nil {
		return false
	}

	return true
}

func (c *CallConnection) Close() error {
	err := c.client.Close()
	if err != nil {
		return err
	}

	return nil
}

func (c *CallConnection) Name() string {
	return c.name
}

func (c *CallConnection) Host() string {
	return c.host
}

func (c *CallConnection) Client() *redis.Client {
	return c.client
}

func (c *CallConnection) API(params ...interface{}) interface{} {
	return c.client
}

func (c *CallConnection) close() {
	_ = c.client.Close()
}
