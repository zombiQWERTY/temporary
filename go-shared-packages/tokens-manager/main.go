package tokens_manager

import (
	"crypto/rsa"
	"gopkg.in/square/go-jose.v2"
	"gopkg.in/square/go-jose.v2/jwt"
	"time"
)

type TokenPair = struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type JwtPayload = struct {
	ID         uint32 `json:"id,string"`
	Permission string
}

type JwtClaims = struct {
	jwt.Claims
	JwtPayload
}

type Hour = int32

func Encrypt(privateKey *rsa.PrivateKey, payload JwtPayload, expiresIn Hour) (string, error) {
	encrypter, err := jose.NewEncrypter(
		jose.A128GCM,
		jose.Recipient{Algorithm: jose.RSA_OAEP, Key: &privateKey.PublicKey},
		(&jose.EncrypterOptions{}).WithType("JWT"),
	)

	if err != nil {
		return "", err
	}

	jwtClaims := jwt.Claims{
		Subject: "DoQA auth",
		Issuer:  "DoQA",
	}

	SetExpiryIn(&jwtClaims, time.Hour*time.Duration(expiresIn))
	SetIssuedNow(&jwtClaims)

	claims := JwtClaims{
		Claims:     jwtClaims,
		JwtPayload: payload,
	}

	token, err := jwt.Encrypted(encrypter).Claims(claims).CompactSerialize()
	if err != nil {
		return "", err
	}

	return token, nil
}

func Decrypt(privateKey *rsa.PrivateKey, token string) (*JwtClaims, error) {
	object, err := jwt.ParseEncrypted(token)
	if err != nil {
		return nil, err
	}

	decoded := &JwtClaims{}
	err = object.Claims(privateKey, decoded)
	if err != nil {
		return nil, err
	}

	return decoded, nil
}

func MakeTokenPair(privateKey *rsa.PrivateKey, payload JwtPayload, accessTokenExpires Hour, refreshTokenExpires Hour) (TokenPair, error) {
	var tokenPair = TokenPair{}
	var accessToken string
	var refreshToken string
	var err error
	if accessToken, err = Encrypt(privateKey, payload, accessTokenExpires); err == nil {
		if refreshToken, err = Encrypt(privateKey, payload, refreshTokenExpires); err == nil {
			tokenPair.AccessToken = accessToken
			tokenPair.RefreshToken = refreshToken
		}
	}

	return tokenPair, err
}

func Validate(claims *JwtClaims) bool {
	return claims.Expiry.Time().After(time.Now())
}
