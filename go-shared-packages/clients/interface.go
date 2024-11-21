package clients

import (
	"time"
)

const (
	WATCHER_INTERVAL   = 30 * time.Second
	CONNECTION_TIMEOUT = 2 * time.Second
)

type CallCommands interface {
	Name() string
	Ready() bool
	Close() error
	API(params ...interface{}) interface{}
}

type CallManager interface {
	GetApiConnection() (CallCommands, error)
	GetApiConnectionById(id string) (CallCommands, error)
	Start() error
	Stop()
}
