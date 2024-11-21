package templates

import (
	"github.com/matcornic/hermes/v2"
)

type CreateOwner struct {
	Email string
}

func (r *CreateOwner) Body(loginUrl string) hermes.Email {
	return hermes.Email{
		Body: hermes.Body{
			Name: r.Email,
			Intros: []string{
				"You have received this email because you just bought our SAAS app.",
			},
			Actions: []hermes.Action{
				{
					Instructions: "Click the button below to go to login:",
					Button: hermes.Button{
						Color: "#DC4D2F",
						Text:  "Continue",
						Link:  loginUrl,
					},
				},
			},
			Outros: []string{
				"If you are intruder, no further action is required on your part.",
			},
			Signature: "Thanks",
		},
	}
}
