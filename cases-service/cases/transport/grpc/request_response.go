package grpc

import "bitbucket.org/ittinc/cases-service/cases_grpc/pb"

type CountCasesRequest struct {
	Space    []uint32
	TenantID string
}

type CountCasesResponse struct {
	Result []*pb.CountBySpace
}

//type Error struct {
//	Message    string            `json:"message"`
//	Code       int32             `json:"code"`
//	Validation map[string]string `json:"validation"`
//}
