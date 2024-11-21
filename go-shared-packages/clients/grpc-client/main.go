package grpc_client

import (
	"bitbucket.org/ittinc/go-shared-packages/clients"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
)

type CallConnection struct {
	name              string
	host              string
	makeServiceClient func(*grpc.ClientConn) interface{}
	client            *grpc.ClientConn
	api               interface{}
}

func NewCallConnection(name, url string, makeServiceClient func(*grpc.ClientConn) interface{}) (*CallConnection, error) {
	c := &CallConnection{
		makeServiceClient: makeServiceClient,
		name:              name,
		host:              url,
	}

	client, err := grpc.Dial(url, grpc.WithInsecure(), grpc.WithTimeout(clients.CONNECTION_TIMEOUT))
	c.client = client

	if err != nil {
		return nil, err
	}

	c.api = makeServiceClient(c.client)
	return c, nil
}

func (c *CallConnection) Ready() bool {
	switch c.client.GetState() {
	case connectivity.Idle, connectivity.Ready:
		return true
	}

	return false
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

func (c *CallConnection) Client() *grpc.ClientConn {
	return c.client
}

func (c *CallConnection) API(params ...interface{}) interface{} {
	return c.api
}

func (c *CallConnection) close() {
	_ = c.client.Close()
}
