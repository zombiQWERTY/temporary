package clients

import (
	"github.com/sirupsen/logrus"
	"time"
)

type WatcherNotify func()

type Watcher struct {
	logger          *logrus.Entry
	name            string
	stop            chan struct{}
	stopped         chan struct{}
	pollingInterval time.Duration
	PollAndNotify   WatcherNotify
}

func MakeWatcher(name string, pollingInterval time.Duration, pollAndNotify WatcherNotify, logger *logrus.Entry) *Watcher {
	return &Watcher{
		logger:          logger.WithField("watcherName", name),
		name:            name,
		stop:            make(chan struct{}),
		stopped:         make(chan struct{}),
		pollingInterval: pollingInterval,
		PollAndNotify:   pollAndNotify,
	}
}

func (watcher *Watcher) Start() {
	watcher.logger.Debug("Watcher started")

	defer func() {
		watcher.logger.Debug("Watcher finished")
		close(watcher.stopped)
	}()

	for {
		select {
		case <-watcher.stop:
			watcher.logger.Debug("Watcher received stop signal")
			return
		case <-time.After(watcher.pollingInterval):
			watcher.PollAndNotify()
		}
	}
}

func (watcher *Watcher) Stop() {
	watcher.logger.Debug("Watcher stopping")
	close(watcher.stop)
	<-watcher.stopped
}
