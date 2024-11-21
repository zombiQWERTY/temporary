package http

import (
	"encoding/json"
	"net/http"
)

func encodeRegisterResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(RegisterResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeLoginResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(LoginResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeRefreshTokenResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(RefreshTokenResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeLogoutResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(LogoutResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetInvitedInfoResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetInvitedInfoResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetUserResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetUserResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetAllUsersResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetAllUsersResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodePatchUserResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(PatchUserResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeInviteUserResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(InviteUserResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeCheckUserMetaExistsResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CheckUserMetaExistsResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeMultipleUsersEditResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(MultipleUsersEditResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeMultipleUsersDeleteResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(MultipleUsersDeleteResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeMultipleUsersToggleBlockResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(MultipleUsersToggleBlockResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeWsEchoResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(WsEchoResponse)
	return json.NewEncoder(w).Encode(data)
}
