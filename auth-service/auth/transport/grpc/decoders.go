package grpc

import (
	"bitbucket.org/ittinc/auth-service/auth_grpc/pb"
	"context"
	"strings"
)

func decodeWriteToRedisRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.WriteToRedisRequest)
	return WriteToRedisRequest{TenantID: req.TenantID, Key: req.Key, Value: req.Value, Ex: req.Ex}, nil
}

func decodeReadFromRedisRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.ReadFromRedisRequest)
	return ReadFromRedisRequest{TenantID: req.TenantID, Key: req.Key}, nil
}

func decodeDoAuthRequest(_ context.Context, r interface{}) (interface{}, error) {
	req := r.(*pb.DoAuthRequest)

	tokenType := "BEARER"
	tokenTypeLength := len(tokenType + " ")

	token := ""
	if len(req.AccessToken) > tokenTypeLength && strings.ToUpper(req.AccessToken[0:len(tokenType)]) == "BEARER" {
		token = req.AccessToken[tokenTypeLength:]
	}

	return DoAuthRequest{TenantID: req.TenantID, AccessToken: token}, nil
}
