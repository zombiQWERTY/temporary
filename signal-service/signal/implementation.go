package signal

import (
	"context"
)

type Implementation interface {
	FireEvent(ctx context.Context, IDs []uint32, TenantID, Event, Payload string) bool
}
