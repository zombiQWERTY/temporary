module bitbucket.org/ittinc/mailer-service

go 1.14

require (
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200229135543-c02eb4432c1a
	bitbucket.org/ittinc/mailer-service/mailer_grpc v0.0.0-20200228234827-c9d68c812b85
	github.com/go-gomail/gomail v0.0.0-20160411212932-81ebce5c23df
	github.com/go-kit/kit v0.9.0
	github.com/go-logfmt/logfmt v0.4.0 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.1.0
	github.com/matcornic/hermes/v2 v2.0.2
	github.com/sirupsen/logrus v1.4.2
	golang.org/x/net v0.0.0-20191112182307-2180aed22343 // indirect
	google.golang.org/grpc v1.26.0
	gopkg.in/alexcesaro/quotedprintable.v3 v3.0.0-20150716171945-2caba252f4dc // indirect
	gopkg.in/gomail.v2 v2.0.0-20160411212932-81ebce5c23df // indirect
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
