package grpc

import (
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"context"
)

func encodeCountCasesResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(CountCasesResponse)
	return &pb.CountCasesResponse{Result: res.Result}, nil
}
