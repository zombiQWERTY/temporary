package logger

import (
	"context"
	"github.com/go-chi/chi/middleware"
	"github.com/sirupsen/logrus"
)

type ErrorHandler interface {
	Handle(ctx context.Context, err error)
}

type Logger struct {
	Logger *logrus.Entry
}

func UseLogger(log *logrus.Entry) *Logger {
	return &Logger{
		Logger: log,
	}
}

func (l *Logger) TenantID(value string) *Logger {
	l.Logger = l.Logger.WithField("tenantID", value)
	return l
}

func (l *Logger) Method(value string) *Logger {
	l.Logger = l.Logger.WithField("method", value)
	return l
}

func (l *Logger) User(value interface{}) *Logger {
	l.Logger = l.Logger.WithField("userID", value)
	return l
}

func (l *Logger) WithError(value interface{}) *logrus.Entry {
	l.Logger = l.Logger.WithField("error", value)
	return l.Logger
}

func (l *Logger) WithReqID(ctx context.Context) *Logger {
	reqID := middleware.GetReqID(ctx)
	l.Logger = l.Logger.WithField("requestId", reqID)
	return l
}

func (l *Logger) RedisDownError(err error) {
	l.Logger.WithField("error", err).Error("Redis down")
}

func (l *Logger) TenantsDownError(err error) {
	l.Logger.WithField("error", err).Error("Tenants service down")
}

func (l *Logger) UsersDownError(err error) {
	l.Logger.WithField("error", err).Error("Users service down")
}

func (l *Logger) AuthDownError(err error) {
	l.Logger.WithField("error", err).Error("Auth service down")
}

func (l *Logger) DatabaseDownError(err error) {
	l.Logger.WithField("error", err).Error("Database down")
}

func (l *Logger) MailerDownError(err error) {
	l.Logger.WithField("error", err).Error("Mailer down")
}

func (l *Logger) CasesDownError(err error) {
	l.Logger.WithField("error", err).Error("Cases down")
}

func (l *Logger) Handle(ctx context.Context, err error) {
	l.Logger.Error("error", err)
}
