package http

import (
	"encoding/json"
	"net/http"
)

func encodeCreateCaseResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateCaseResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetCasesResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetCasesResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetCaseResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetCaseResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeEditCaseResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(EditCaseResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDeleteCaseResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DeleteCaseResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeCreateStepGroupResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateStepGroupResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetStepGroupsResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetStepGroupsResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetStepGroupResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetStepGroupResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeEditStepGroupResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(EditStepGroupResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDeleteStepGroupResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DeleteStepGroupResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeCreateStepResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateStepResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetStepsResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetStepsResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeGetStepResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(GetStepResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeEditStepResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(EditStepResponse)
	return json.NewEncoder(w).Encode(data)
}

func encodeDeleteStepResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(DeleteStepResponse)
	return json.NewEncoder(w).Encode(data)
}
