package encoder

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"strings"
)

type Encoder interface {
	Encode([]byte) ([]byte, error)
	Decode([]byte) ([]byte, error)
	DecodeString(string) (string, error)
	EncodeString([]byte) (string, error)
}

type AESEncoder struct {
	key []byte
}

type EncodedAESToken struct {
	Iv    string
	Mac   string
	Value string
}

// Creates new AES-256-CBC encoder. This encoder needs 32 length key.
// The key can be encoded to base64 format and provided with base64: prefix
func NewAESEncoder(key string) (*AESEncoder, error) {
	var bytesKey []byte
	var err error

	if strings.Contains(key, "base64:") {
		bytesKey, err = base64.StdEncoding.DecodeString(key[7:])
		if err != nil {
			return nil, err
		}
	}
	if len(bytesKey) != 32 {
		return nil, errors.New("key must be 32 bytes length")
	}

	return &AESEncoder{key: bytesKey}, nil
}

func (enc *AESEncoder) Decode(data []byte) ([]byte, error) {
	token := &EncodedAESToken{}
	err := json.Unmarshal(data, token)

	if err != nil {
		return []byte{}, err
	}

	if !enc.validPayload(token) {
		return []byte{}, errors.New("payload has invalid format")
	}

	if !enc.validMac(token) {
		return []byte{}, errors.New("mac is not valid")
	}

	iv, _ := base64.StdEncoding.DecodeString(token.Iv)
	value, _ := hex.DecodeString(token.Value)

	block, err := aes.NewCipher(enc.key)
	if err != nil {
		return []byte{}, err
	}

	mode := cipher.NewCBCDecrypter(block, iv)
	decodedData := make([]byte, len(value)-aes.BlockSize)
	mode.CryptBlocks(decodedData, value[aes.BlockSize:])

	return Unpad(decodedData, aes.BlockSize)

}

func (enc *AESEncoder) DecodeString(value string) (string, error) {
	decodedToken, err := base64.StdEncoding.DecodeString(value)
	if err != nil {
		return "", err
	}
	decodedValue, err := enc.Decode(decodedToken)
	return string(decodedValue), err
}

func (enc *AESEncoder) Encode(data []byte) ([]byte, error) {
	data, err := Pad(data, aes.BlockSize)

	if err != nil {
		return nil, err
	}
	if len(data)%aes.BlockSize != 0 {
		return []byte{}, errors.New("padded data has the wrong block size")
	}

	block, err := aes.NewCipher(enc.key)
	if err != nil {
		return nil, err
	}
	encryptedData := make([]byte, aes.BlockSize+len(data))

	iv := encryptedData[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}

	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(encryptedData[aes.BlockSize:], data)

	iv64 := base64.StdEncoding.EncodeToString(iv)
	mac := hex.EncodeToString(Hash(append(encryptedData, []byte(iv64)...), enc.key))

	token := &EncodedAESToken{
		Iv:    iv64,
		Mac:   mac,
		Value: hex.EncodeToString(encryptedData),
	}
	tokenJson, _ := json.Marshal(token)
	return tokenJson, nil
}

func (enc *AESEncoder) EncodeString(data []byte) (string, error) {
	token, err := enc.Encode(data)
	return base64.StdEncoding.EncodeToString(token), err
}

func (enc *AESEncoder) validPayload(token *EncodedAESToken) bool {
	iv, _ := base64.StdEncoding.DecodeString(token.Iv)
	if len(token.Iv) > 0 &&
		len(token.Mac) > 0 &&
		len(token.Value) > 0 &&
		len(iv) == aes.BlockSize {
		return true
	}
	return false
}

func (enc *AESEncoder) validMac(token *EncodedAESToken) bool {
	bytes := make([]byte, aes.BlockSize)
	_, err := rand.Read(bytes)

	if err != nil {
		return false
	}

	valueDecoded, _ := hex.DecodeString(token.Value)
	calculated := Hash([]byte(hex.EncodeToString(Hash(append(valueDecoded, []byte(token.Iv)...), enc.key))), bytes)

	return hmac.Equal(calculated, Hash([]byte(token.Mac), bytes))
}

func Hash(data []byte, key []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func Pad(buf []byte, size int) ([]byte, error) {
	bufLen := len(buf)
	padLen := size - bufLen%size
	padded := make([]byte, bufLen+padLen)
	copy(padded, buf)
	for i := 0; i < padLen; i++ {
		padded[bufLen+i] = byte(padLen)
	}
	return padded, nil
}

func Unpad(padded []byte, size int) ([]byte, error) {
	if len(padded)%size != 0 {
		return nil, errors.New("Padded value wasn't in correct size.")
	}

	bufLen := len(padded) - int(padded[len(padded)-1])
	buf := make([]byte, bufLen)
	copy(buf, padded[:bufLen])
	return buf, nil
}

func ToSha256(text string) string {
	hasher := sha256.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}
