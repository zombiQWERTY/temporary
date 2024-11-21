package grpc

import (
	"bitbucket.org/ittinc/cases-service/cases_grpc/pb"
	"context"
)

func decodeCountCasesRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.CountCasesRequest)
	return CountCasesRequest{Space: req.Space, TenantID: req.TenantID}, nil
}
