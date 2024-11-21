package grpc

import (
	"bitbucket.org/ittinc/signal-service/signal_grpc/pb"
	"context"
)

func decodeFireEventRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.FireEventRequest)
	return FireEventRequest{TenantID: req.TenantID, IDs: req.IDs, Event: req.Event, Payload: req.Payload}, nil
}
