module bitbucket.org/ittinc/tenants-service

go 1.14

require (
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200229135543-c02eb4432c1a
	bitbucket.org/ittinc/tenants-service/tenants_grpc v0.0.0-20200229001543-dfd59c7d57af
	github.com/go-kit/kit v0.9.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.1.0
	github.com/jinzhu/gorm v1.9.12
	github.com/sirupsen/logrus v1.4.2
	go.uber.org/multierr v1.3.0 // indirect
	google.golang.org/grpc v1.26.0
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
