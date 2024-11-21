package grpc

import (
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
)

type SendRequest struct {
	Data []*pb.Email `valid:"optional"`
}

type SendResponse struct {
	Success bool  `json:"success"`
	Error   Error `json:"error,omitempty"`
}

type Error struct {
	Message    string            `json:"message"`
	Code       int32             `json:"code"`
	Validation map[string]string `json:"validation"`
}
