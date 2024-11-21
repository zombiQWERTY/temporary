package encoder

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAES(t *testing.T) {
	t.Run("Enc Dec", func(t *testing.T) {
		encoder, _ := NewAESEncoder("base64:qHid5j5ibQ3EHjoMCACAmw2q2tyr+EGwXkq1wbajC1o=")

		plainTexts := []string{"1234567890", "123456789012345678901234567890123456789012345678901234567890", "1", ""}

		for _, plainText := range plainTexts {
			encrypted, _ := encoder.EncodeString([]byte(plainText))
			decrypted, _ := encoder.DecodeString(encrypted)
			assert.Equal(t, plainText, decrypted)
		}

	})
}
