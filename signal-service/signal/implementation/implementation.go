package implementation

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/go-shared-packages/service-discovery"
	"bitbucket.org/ittinc/signal-service/signal"
	"bitbucket.org/ittinc/signal-service/ws"
	"context"
	"github.com/sirupsen/logrus"
)

type SignalImpl struct {
	serviceDiscovery service_discovery.ServiceDiscovery
	hub              *ws.Hub
	log              *logger.Logger
}

func NewSignalImpl(serviceDiscovery service_discovery.ServiceDiscovery, hub *ws.Hub, log *logrus.Entry) signal.Implementation {
	return &SignalImpl{
		serviceDiscovery: serviceDiscovery,
		hub:              hub,
		log:              logger.UseLogger(log),
	}
}

func (u *SignalImpl) FireEvent(ctx context.Context, IDs []uint32, tenantID, event, payload string) bool {
	_ = u.log.TenantID(tenantID).Method("FireEvent")

	for c, _ := range u.hub.Clients {
		for _, id := range IDs {
			if c.TenantID == tenantID && c.ID == id {
				c.Send <- c.MakePayload(event, payload)
			}
		}
	}
	return true
}
