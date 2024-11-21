package mailer

import (
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"context"
)

type Implementation interface {
	Send(ctx context.Context, data []*pb.Email) (bool, error)
}
