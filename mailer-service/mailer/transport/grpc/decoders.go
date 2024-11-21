package grpc

import (
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"context"
)

func decodeSendRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.SendRequest)
	return SendRequest{
		Data: req.Email,
	}, nil
}
