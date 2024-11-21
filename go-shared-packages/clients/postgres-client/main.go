package postgres_client

import (
	"bitbucket.org/ittinc/go-shared-packages/sql-pool"
	"context"
	"fmt"
	"github.com/jinzhu/gorm"
	"sync"
)

type CallCommands interface {
	Name() string
	Ready() bool
	Close() error
	API(tenantID string) (*gorm.DB, error)
}

type CallConnection struct {
	name     string
	host     string
	user     string
	address  string
	password string
	port     int
	client   context.Context
	sync.RWMutex
}

func NewCallConnection(name, user, password, address string, port int, db string) (*CallConnection, error) {
	url := fmt.Sprintf("%s:%d", address, port)

	c := &CallConnection{
		name:     name,
		host:     url,
		user:     user,
		address:  address,
		password: password,
		port:     port,
	}

	ctx := context.Background()
	connection := fmt.Sprintf("user=%s password=%s host=%s port=%d dbname=%s sslmode=disable",
		user, password, address, port, db)

	newCTX, err := sql_pool.OpenSQL(ctx, db, "postgres", connection)
	if err != nil {
		return nil, err
	}

	c.client = newCTX

	return c, nil
}

func (c *CallConnection) Ready() bool {
	idx := sql_pool.SqlIndexFrom(c.client)
	for _, db := range idx {
		if db == nil {
			return false
		}

		err := db.DB().Ping()
		if err != nil {
			return false
		}
	}

	return true
}

func (c *CallConnection) Close() error {
	idx := sql_pool.SqlIndexFrom(c.client)
	for _, db := range idx {
		if db == nil {
			return nil
		}

		err := db.Close()
		if err != nil {
			return err
		}
	}

	return nil
}

func (c *CallConnection) Name() string {
	return c.name
}

func (c *CallConnection) Host() string {
	return c.host
}

func (c *CallConnection) Client() context.Context {
	return c.client
}

func (c *CallConnection) API(tenantID string) (*gorm.DB, error) {
	c.Lock()
	defer c.Unlock()

	fromCtx := sql_pool.SQL(c.client, tenantID)

	if fromCtx != nil {
		return fromCtx, nil
	}

	connection := fmt.Sprintf("user=%s password=%s host=%s port=%d dbname=%s sslmode=disable", c.user, c.password, c.address, c.port, tenantID)

	newCTX, err := sql_pool.OpenSQL(c.client, tenantID, "postgres", connection)
	if err != nil {
		return nil, err
	}

	c.client = newCTX

	return sql_pool.SQL(c.client, tenantID), nil
}

func (c *CallConnection) close() {
	_ = c.Close()
}
