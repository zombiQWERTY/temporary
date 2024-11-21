package http

import (
	"encoding/json"
	"net/http"
)

func encodeCreateCompanyResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(CreateCompanyResponse)
	return json.NewEncoder(w).Encode(data)
}
