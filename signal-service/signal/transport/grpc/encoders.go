package grpc

import (
	"bitbucket.org/ittinc/signal-service/signal_grpc/pb"
	"context"
)

func encodeFireEventResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(FireEventResponse)
	return &pb.FireEventResponse{Success: res.Success}, nil
}
