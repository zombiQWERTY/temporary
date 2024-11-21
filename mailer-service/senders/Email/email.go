package Email

import (
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"bitbucket.org/ittinc/mailer-service/model"
	"errors"
	"github.com/go-gomail/gomail"
	"net/mail"
	"strconv"
)

type smtpAuthentication struct {
	Server         string
	Port           int
	SenderEmail    string
	SenderIdentity string
	SMTPUser       string
	SMTPPassword   string
}

type sendOptions struct {
	To      string
	Subject string
}

func SendEmail(data *pb.Email, getConfigByKey func(key string) *string) error {
	smtpServer := getConfigByKey(model.HERMES_SMTP_SERVER_KEY)
	smtpPort := getConfigByKey(model.HERMES_SMTP_PORT_KEY)
	smtpPassword := getConfigByKey(model.HERMES_SMTP_PASSWORD_KEY)
	smtpUser := getConfigByKey(model.HERMES_SMTP_USER_KEY)
	senderEmail := getConfigByKey(model.HERMES_SENDER_EMAIL_KEY)
	senderIdentity := getConfigByKey(model.HERMES_SENDER_IDENTITY_KEY)

	if smtpServer == nil {
		return errors.New("SMTP server config is empty")
	}

	if smtpPort == nil {
		return errors.New("SMTP port config is empty")
	}

	if smtpPassword == nil {
		return errors.New("SMTP password config is empty")
	}

	if smtpUser == nil {
		return errors.New("SMTP user config is empty")
	}

	if senderEmail == nil {
		return errors.New("SMTP sender email config is empty")
	}

	if senderIdentity == nil {
		return errors.New("SMTP sender identity config is empty")
	}

	port, _ := strconv.Atoi(*smtpPort)
	smtpConfig := smtpAuthentication{
		Server:         *smtpServer,
		Port:           port,
		SenderEmail:    *senderEmail,
		SenderIdentity: *senderIdentity,
		SMTPPassword:   *smtpPassword,
		SMTPUser:       *smtpUser,
	}

	if len(data.SenderEmail) != 0 {
		smtpConfig.SenderEmail = data.SenderEmail
	}

	if len(data.SenderIdentity) != 0 {
		smtpConfig.SenderEmail = data.SenderIdentity
	}

	options := sendOptions{
		To:      data.To,
		Subject: data.Subject,
	}

	return send(smtpConfig, options, data.Html, data.Plain)
}

func send(smtpConfig smtpAuthentication, options sendOptions, htmlBody string, txtBody string) error {
	from := mail.Address{
		Name:    smtpConfig.SenderIdentity,
		Address: smtpConfig.SenderEmail,
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from.String())
	m.SetHeader("To", options.To)
	m.SetHeader("Subject", options.Subject)

	m.SetBody("text/html", htmlBody)
	if len(txtBody) > 0 {
		m.AddAlternative("text/plain", txtBody)
	}

	d := gomail.NewDialer(smtpConfig.Server, smtpConfig.Port, smtpConfig.SMTPUser, smtpConfig.SMTPPassword)

	return d.DialAndSend(m)
}
