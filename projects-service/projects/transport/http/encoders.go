package http

import (
	"encoding/json"
	"net/http"
)

func encodeCreateProjectResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateProjectResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetProjectsResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetProjectsResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetProjectResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetProjectResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeEditProjectResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(EditProjectResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDeleteProjectResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DeleteProjectResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeCreateSpaceResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateSpaceResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeEditSpaceResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(EditSpaceResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDNDSpacesResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DNDSpacesResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDeleteSpaceResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DeleteSpaceResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeStarResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(StarResponse)
	return json.NewEncoder(w).Encode(data)
}
