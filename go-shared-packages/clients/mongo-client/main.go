package mongo_client

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"reflect"
)

type CallConnection struct {
	name   string
	host   string
	client *mongo.Client
}

func NewCallConnection(name, url string) (*CallConnection, error) {
	var err error
	c := &CallConnection{
		name: name,
		host: url,
	}

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://" + url))
	if err != nil {
		return nil, err
	}

	err = client.Connect(context.TODO())
	if err != nil {
		return nil, err
	}

	c.client = client

	return c, nil
}

func (c *CallConnection) Ready() bool {
	err := c.client.Ping(context.TODO(), nil)
	if err != nil {
		return false
	}

	return true
}

func (c *CallConnection) Close() error {
	err := c.client.Disconnect(nil)
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

func (c *CallConnection) Client() *mongo.Client {
	return c.client
}

func (c *CallConnection) API(params ...interface{}) *mongo.Database {
	if len(params) < 1 || reflect.TypeOf(params[0]).String() != "string" {
		fmt.Println("DEV MESSAGE: WRONG ARGUMENTS: go-shared-packages/clients/mongo-client/main.go:71") // Cant pass logger here, sorry
		return c.client.Database("develop")
	}

	return c.client.Database(params[0].(string))
}

func (c *CallConnection) close() {
	_ = c.client.Disconnect(nil)
}
