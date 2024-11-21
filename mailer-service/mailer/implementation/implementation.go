package implementation

import (
	"bitbucket.org/ittinc/go-shared-packages/logger"
	"bitbucket.org/ittinc/mailer-service/mailer"
	"bitbucket.org/ittinc/mailer-service/mailer/implementation/email-confirm"
	"bitbucket.org/ittinc/mailer-service/mailer_grpc/pb"
	"bitbucket.org/ittinc/mailer-service/model"
	"bitbucket.org/ittinc/mailer-service/senders/Email"
	"bitbucket.org/ittinc/mailer-service/templates"
	"context"
	"encoding/json"
	"errors"
	"github.com/matcornic/hermes/v2"
	"github.com/sirupsen/logrus"
)

type mailerImpl struct {
	getConfigByKey func(key string) *string
	log            *logger.Logger
}

func NewMailerImpl(getConfigByKey func(key string) *string, log *logrus.Entry) mailer.Implementation {
	return &mailerImpl{
		getConfigByKey: getConfigByKey,
		log:            logger.UseLogger(log),
	}
}

func (u *mailerImpl) Send(ctx context.Context, data []*pb.Email) (bool, error) {
	log := u.log.Method("Send")

	hm := initHermes(log.Logger, u.getConfigByKey)
	if hm == nil {
		log.Logger.Error("hermes config not found")
		return false, errors.New("hermes config not found")
	}

	for _, email := range data {
		switch email.Template {
		case "invite-link":
			var t email_confirm.InviteLinkData
			t.Domain = u.getConfigByKey(model.APP_URL_KEY)
			t.RegistrationUrl = u.getConfigByKey(model.APP_REGISTRATION_URL_KEY)
			t.AppLogoLink = u.getConfigByKey(model.APP_LOGO_LINK_KEY)
			template := u.getConfigByKey(model.APP_EMAIL_CONFIRM_TEMPLATE)

			if t.RegistrationUrl == nil {
				return false, errors.New("APP_REGISTRATION_URL_KEY config not found")
			}

			if t.AppLogoLink == nil {
				return false, errors.New("APP_LOGO_LINK_KEY config not found")
			}

			if template == nil {
				return false, errors.New("APP_EMAIL_CONFIRM_TEMPLATE config not found")
			}
			if t.Domain == nil {
				return false, errors.New("APP_URL_KEY config not found")
			}

			err := json.Unmarshal([]byte(email.CustomContent), &t)
			if err != nil {
				log.Logger.WithError(err).WithField("customContent", email.CustomContent).Error("Cant unmarshal CustomContent")
			}

			html, err := email_confirm.GetInviteLinkTpl(t, *template)
			if err != nil {
				log.Logger.WithError(err).WithField("tplData", t).Error("Cant make template with data")
			}

			email.Html = html
			//email.Plain, _ = hm.GeneratePlainText(t.Body(*registrationUrl))

		case "create-owner":
			var t templates.InviteLink
			loginUrl := u.getConfigByKey(model.APP_LOGIN_URL_KEY)
			if loginUrl == nil {
				return false, errors.New("hermes APP_LOGIN_URL_KEY config not found")
			}

			err := json.Unmarshal([]byte(email.CustomContent), &t)
			if err != nil {
				log.Logger.WithField("customContent", email.CustomContent).Error("Cant unmarshal CustomContent")
			}

			email.Html, _ = hm.GenerateHTML(t.Body(*loginUrl))
			email.Plain, _ = hm.GeneratePlainText(t.Body(*loginUrl))
		default:
			log.Logger.WithField("template", email.Template).Error("Cant find template")
			return false, errors.New("cant find template")
		}

		err := Email.SendEmail(email, u.getConfigByKey)
		if err != nil {
			log.WithError(err).Error("Cant send email")
			return false, err
		}
	}

	return true, nil
}

func initHermes(logger *logrus.Entry, getConfigByKey func(key string) *string) *hermes.Hermes {
	name := getConfigByKey(model.APP_NAME_KEY)
	link := getConfigByKey(model.APP_URL_KEY)
	logo := getConfigByKey(model.APP_LOGO_LINK_KEY)

	if name == nil || link == nil || logo == nil {
		logger.WithFields(logrus.Fields{
			"name": name,
			"link": link,
			"logo": logo,
		}).Error("Some config prop is empty")
		return nil
	}

	return &hermes.Hermes{
		Product: hermes.Product{
			Name: *name,
			Link: *link,
			Logo: *logo,
		},
	}
}
