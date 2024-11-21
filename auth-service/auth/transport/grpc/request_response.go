package grpc

import "time"

type WriteToRedisRequest struct {
	TenantID string
	Key      string
	Value    string
	Ex       int64
}

type WriteToRedisResponse struct {
	Success bool
}

type ReadFromRedisRequest struct {
	TenantID string
	Key      string
}

type ReadFromRedisResponse struct {
	Success bool
	Value   string
}

type ReadFromRedisWithExResponse struct {
	Success bool
	Value   string
	Ex      time.Duration
}

type DoAuthRequest struct {
	TenantID    string
	AccessToken string
}

type DoAuthResponse struct {
	Success bool
	UserID  uint32
}

//type Error struct {
//	Message    string            `json:"message"`
//	Code       int32             `json:"code"`
//	Validation map[string]string `json:"validation"`
//}
