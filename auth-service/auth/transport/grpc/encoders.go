package grpc

import (
	"bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"context"
)

func encodeWriteToRedisResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(WriteToRedisResponse)
	return &pb.WriteToRedisResponse{Success: res.Success}, nil
}

func encodeReadFromRedisResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(ReadFromRedisResponse)
	return &pb.ReadFromRedisResponse{Success: res.Success, Value: res.Value}, nil
}

func encodeReadFromRedisWithExResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(ReadFromRedisWithExResponse)
	return &pb.ReadFromRedisWithExResponse{Success: res.Success, Value: res.Value, Ex: int64(res.Ex)}, nil
}

func encodeDoAuthResponse(_ context.Context, r interface{}) (interface{}, error) {
	res := r.(DoAuthResponse)
	return &pb.DoAuthResponse{Success: res.Success, UserID: res.UserID}, nil
}
