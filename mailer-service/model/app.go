package model

import "time"

const (
	APP_SERVICE_NAME = "mailer_service"
)

const (
	APP_URL_KEY                = "mailer_service/app_url"
	APP_NAME_KEY               = "mailer_service/app_name"
	APP_LOGO_LINK_KEY          = "mailer_service/app_logo_link"
	APP_REGISTRATION_URL_KEY   = "mailer_service/registration_url"
	APP_LOGIN_URL_KEY          = "mailer_service/login_url"
	APP_EMAIL_CONFIRM_TEMPLATE = "mailer_service/templates/email-confirm"
)

const (
	HERMES_SMTP_SERVER_KEY     = "mailer_service/hermes/smtp_server"
	HERMES_SMTP_PORT_KEY       = "mailer_service/hermes/smtp_port"
	HERMES_SMTP_USER_KEY       = "mailer_service/hermes/smtp_user"
	HERMES_SMTP_PASSWORD_KEY   = "mailer_service/hermes/smtp_password"
	HERMES_SENDER_EMAIL_KEY    = "mailer_service/hermes/smtp_email"
	HERMES_SENDER_IDENTITY_KEY = "mailer_service/hermes/smtp_identity"
)

const (
	APP_DEREGESTER_CRITICAL_TTL = time.Minute * 2
	APP_SERVICE_TTL             = time.Second * 30
)
