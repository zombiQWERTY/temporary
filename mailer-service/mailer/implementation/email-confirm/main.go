package email_confirm

import (
	"bytes"
	"html/template"
	"time"
)

type InviteLinkData struct {
	Token           string
	Email           string
	RegistrationUrl *string
	AppLogoLink     *string
	Domain          *string
	Year            int
}

func GetInviteLinkTpl(data InviteLinkData, tplString string) (string, error) {
	t, err := template.New("email-confirm").Parse(tplString)
	if err != nil {
		return "", err
	}

	data.Year = time.Now().Year()

	var tpl bytes.Buffer
	if err := t.Execute(&tpl, data); err != nil {
		return "", err
	}

	return tpl.String(), nil
}
