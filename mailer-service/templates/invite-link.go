package templates

import (
	"github.com/matcornic/hermes/v2"
)

type InviteLink struct {
	Token string
	Email string
}

func (r *InviteLink) Body(registrationUrl string) hermes.Email {
	return hermes.Email{
		Body: hermes.Body{
			Name: r.Email,
			Intros: []string{
				"You have received this email because admin of our app decided that you have to join us.",
			},
			Actions: []hermes.Action{
				{
					Instructions: "Click the button below to continue registration:",
					Button: hermes.Button{
						Color: "#DC4D2F",
						Text:  "Continue",
						Link:  registrationUrl + r.Token,
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
