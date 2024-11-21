package password

import (
	"bytes"
	"encoding/base64"
	"github.com/segmentio/ksuid"
	"golang.org/x/crypto/pbkdf2"
	"hash"
	"math/rand"
)

type Password struct {
	Digest     func() hash.Hash
	SaltSize   int
	KeyLen     int
	Iterations int
}

type HashResult struct {
	CipherText string
	Salt       string
}

func NewPassword(digest func() hash.Hash, saltSize int, keyLen int, iter int) *Password {
	return &Password{
		Digest:     digest,
		SaltSize:   saltSize,
		KeyLen:     keyLen,
		Iterations: iter,
	}
}

func (p *Password) HashPassword(password string) HashResult {
	saltBytes := make([]byte, p.SaltSize)
	rand.Read(saltBytes)
	saltString := base64.StdEncoding.EncodeToString(saltBytes)
	salt := bytes.NewBufferString(saltString).Bytes()
	df := pbkdf2.Key([]byte(password), salt, p.Iterations, p.KeyLen, p.Digest)
	cipherText := base64.StdEncoding.EncodeToString(df)

	return HashResult{CipherText: cipherText, Salt: saltString}
}

func (p *Password) VerifyPassword(password, cipherText, salt string) bool {
	saltBytes := bytes.NewBufferString(salt).Bytes()
	df := pbkdf2.Key([]byte(password), saltBytes, p.Iterations, p.KeyLen, p.Digest)
	newCipherText := base64.StdEncoding.EncodeToString(df)
	return newCipherText == cipherText
}

func RandomHash() string {
	return ksuid.New().String()
}
