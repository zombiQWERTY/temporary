package tokens_manager

import (
	"gopkg.in/square/go-jose.v2/jwt"
	"net/http"
	"strings"
	"time"
)

// UnixTime returns the given time in UTC milliseconds
func UnixTime(tm time.Time) int64 {
	return tm.UTC().Unix()
}

// EpochNow is a helper function that returns the NumericDate time value used by the spec
func EpochNow() int64 {
	return time.Now().UTC().Unix()
}

// ExpireIn is a helper function to return calculated time in the future for "exp" claim
func ExpireIn(tm time.Duration) int64 {
	return EpochNow() + int64(tm.Seconds())
}

// Set issued at ("iat") to specified time in the claims
func SetIssuedAt(claims *jwt.Claims, tm time.Time) {
	date := jwt.NumericDate(tm.UTC().Unix())
	claims.IssuedAt = &date
}

// Set issued at ("iat") to present time in the claims
func SetIssuedNow(claims *jwt.Claims) {
	date := jwt.NumericDate(EpochNow())
	claims.IssuedAt = &date
}

// Set expiry ("exp") in the claims
func SetExpiry(claims *jwt.Claims, tm time.Time) {
	date := jwt.NumericDate(tm.UTC().Unix())
	claims.Expiry = &date
}

// Set expiry ("exp") in the claims to some duration from the present time
func SetExpiryIn(claims *jwt.Claims, tm time.Duration) {
	date := jwt.NumericDate(ExpireIn(tm))
	claims.Expiry = &date
}

// TokenFromCookie tries to retrieve the token string from a cookie named "jwt".
func TokenFromCookie(r *http.Request) string {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return ""
	}

	return cookie.Value
}

// TokenFromHeader tries to retrieve the token string from the "Authorization" request header: "Authorization: BEARER T".
func TokenFromHeader(r *http.Request) string {
	bearer := r.Header.Get("Authorization")
	tokenType := "BEARER"
	tokenTypeLength := len(tokenType + " ")
	if len(bearer) > tokenTypeLength && strings.ToUpper(bearer[0:len(tokenType)]) == "BEARER" {
		return bearer[tokenTypeLength:]
	}

	return ""
}

// TokenFromQuery tries to retrieve the token string from the "jwt" URI query parameter.
func TokenFromQuery(r *http.Request) string {
	return r.URL.Query().Get("jwt")
}
