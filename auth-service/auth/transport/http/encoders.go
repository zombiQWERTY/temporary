package http

import (
	"bitbucket.org/ittinc/auth-service/models"
	"net/http"
	"strconv"
)

func encodeAuthResponse(w http.ResponseWriter, response interface{}) error {
	data := response.(models.AuthResult)
	if !data.Success {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return nil
	}

	w.Header().Add("X-Forwarded-User", strconv.FormatUint(uint64(data.JWTPayload.ID), 10))
	w.Header().Add("X-Forwarded-Permissions", data.JWTPayload.Permission)
	w.Header().Add("X-Forwarded-Tenant", data.TenantID)
	w.WriteHeader(http.StatusOK)

	return nil
}
