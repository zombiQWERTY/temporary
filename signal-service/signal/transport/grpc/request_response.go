package grpc

type FireEventRequest struct {
	IDs      []uint32
	TenantID string
	Event    string
	Payload  string
}

type FireEventResponse struct {
	Success bool
}

//type Error struct {
//	Message    string            `json:"message"`
//	Code       int32             `json:"code"`
//	Validation map[string]string `json:"validation"`
//}
