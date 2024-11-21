package tokens_manager

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
)

const BIT_SIZE = 2048

func generatePrivateKey() (*rsa.PrivateKey, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, BIT_SIZE)
	if err != nil {
		return nil, err
	}

	err = privateKey.Validate()
	if err != nil {
		return nil, err
	}

	return privateKey, nil
}

func encodePrivateKeyToPEM(privateKey *rsa.PrivateKey, headers map[string]string) []byte {
	privDER := x509.MarshalPKCS1PrivateKey(privateKey)

	privBlock := pem.Block{
		Type:    "RSA PRIVATE KEY",
		Headers: headers,
		Bytes:   privDER,
	}

	privatePEM := pem.EncodeToMemory(&privBlock)

	return privatePEM
}

func EncodeData(headers map[string]string) ([]byte, error) {
	privateKey, err := generatePrivateKey()
	if err != nil {
		return nil, err
	}

	privateKeyBytes := encodePrivateKeyToPEM(privateKey, headers)
	return privateKeyBytes, nil
}

func DecodePrivateKey(bytes []byte) (*rsa.PrivateKey, map[string]string, error) {
	block, _ := pem.Decode(bytes)
	if block == nil {
		return nil, nil, errors.New("no PEM data found")
	}

	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, nil, err
	}

	return key, block.Headers, nil
}
