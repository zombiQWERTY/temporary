package connections_pool

import (
	"errors"
	"github.com/sirupsen/logrus"
	"sync"
)

var (
	ErrNotFoundConnection  = errors.New("Not found connection")
	ErrNotOpenedConnection = errors.New("Connection closed")
	ErrNoOpenedConnections = errors.New("No opened connections")
)

type Strategy string

const (
	StrategyRoundRobin Strategy = "round-robin"
)

type ServiceConnection struct {
	Id      string
	Service string
	Host    string
	Port    int
}

type Connection interface {
	Name() string
	Ready() bool
	Close() error
}

type Pool interface {
	Append(connection Connection)
	Remove(id string)
	GetById(id string) (Connection, error)
	Get(strategy Strategy) (Connection, error)
	All() []Connection
	CloseAllConnections()
	RecheckConnections()
}

func NewPoolConnections(logger *logrus.Entry) Pool {
	return &connectionsPool{
		logger:      logger,
		connections: make([]Connection, 0, 1),
		iterator:    &connectionIterator{},
	}
}

type connectionIterator struct {
	index  int
	length int
}

func (c *connectionIterator) Next() int {
	c.index = (c.index + 1) % c.length
	return c.index
}

type connectionsPool struct {
	logger      *logrus.Entry
	connections []Connection
	iterator    *connectionIterator
	index       int
	sync.RWMutex
}

func (c *connectionsPool) Append(conn Connection) {
	c.Lock()
	c.connections = append(c.connections, conn)
	c.iterator.length = len(c.connections)
	c.Unlock()
}

func (c *connectionsPool) Remove(id string) {
	c.Lock()
	defer c.Unlock()

	for i, v := range c.connections {
		if v.Name() == id {
			c.iterator.length = len(c.connections) - 1
			c.connections[i] = c.connections[c.iterator.length]
			if err := c.connections[c.iterator.length].Close(); err != nil {
				c.logger.WithField("error", err).Error("Connection closing error")
			}
			c.connections[c.iterator.length] = nil
			c.connections = c.connections[:len(c.connections)-1]

			c.logger.Debug("Connection removed")
			return
		}
	}
}

func (c *connectionsPool) GetById(id string) (Connection, error) {
	c.RLock()
	defer c.RUnlock()

	for _, v := range c.connections {
		if v.Name() == id {
			return v, nil
		}
	}

	return nil, ErrNotFoundConnection
}

func (c *connectionsPool) Get(strategy Strategy) (Connection, error) {
	c.RLock()
	defer c.RUnlock()

	if c.iterator.length == 0 {
		return nil, ErrNoOpenedConnections
	}

	if strategy == StrategyRoundRobin {
		i := c.iterator.index

		for j := c.iterator.Next(); ; j = c.iterator.Next() {
			if c.connections[j].Ready() {
				return c.connections[j], nil
			}

			if i == j {
				break
			}
		}
	}

	return nil, ErrNotOpenedConnection
}

func (c *connectionsPool) CloseAllConnections() {
	c.Lock()
	defer c.Unlock()

	for _, v := range c.connections {
		log := c.logger.WithField("name", v.Name())

		if err := v.Close(); err != nil {
			log.Error("Connection closing error", err)
			return
		}

		log.Debug("close connection")
	}
}

func (c *connectionsPool) All() []Connection {
	return c.connections
}

func (c *connectionsPool) RecheckConnections() {
	for _, conn := range c.connections {
		if conn != nil && !conn.Ready() {
			c.Remove(conn.Name())
		}
	}
}
