package main

import (
	"bitbucket.org/ittinc/mailer-service/server"
	"github.com/sirupsen/logrus"
	"io"
	"os"
)

var log = logrus.New()

func initLogger() *os.File {
	file, err := os.OpenFile("./logs/info.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}

	log.SetOutput(io.MultiWriter(os.Stdout, file))
	log.SetFormatter(&logrus.JSONFormatter{})
	log.SetLevel(logrus.TraceLevel)
	//log.SetLevel(log.WarnLevel)
	log.SetReportCaller(true)

	return file
}

func main() {
	file := initLogger()
	defer file.Close()

	app := server.NewApp(log.WithField("", ""))
	app.Run()
}
