package grpc

import (
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"context"
)

func encodeSendResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(*SendResponse)
	return &pb.SendResponse{
		Success: res.Success,
		Error: &pb.Error{
			Message:    res.Error.Message,
			Code:       res.Error.Code,
			Validation: res.Error.Validation,
		},
	}, nil
}
