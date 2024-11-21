module bitbucket.org/ittinc/cases-service

go 1.14

require (
	bitbucket.org/ittinc/cases-service/cases_grpc v0.0.0-20200328232122-983a0878623e
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200306111831-2236a1656065
	bitbucket.org/ittinc/users-service/users_grpc v0.0.0-20200229140424-a40026ea8f39
	emperror.dev/errors v0.5.2
	github.com/armon/go-metrics v0.3.3 // indirect
	github.com/asaskevich/govalidator v0.0.0-20190424111038-f61b66f89f4a
	github.com/biezhi/gorm-paginator/pagination v0.0.0-20190124091837-7a5c8ed20334
	github.com/go-chi/chi v4.0.3+incompatible
	github.com/go-kit/kit v0.9.0
	github.com/golang/protobuf v1.3.5 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.2.0
	github.com/hashicorp/consul/api v1.4.0 // indirect
	github.com/hashicorp/go-hclog v0.12.1 // indirect
	github.com/hashicorp/go-immutable-radix v1.2.0 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/serf v0.9.0 // indirect
	github.com/jinzhu/gorm v1.9.12
	github.com/mattn/go-colorable v0.1.6 // indirect
	github.com/mitchellh/mapstructure v1.2.2 // indirect
	github.com/sirupsen/logrus v1.5.0
	go.uber.org/multierr v1.3.0 // indirect
	golang.org/x/net v0.0.0-20200324143707-d3edc9973b7e // indirect
	golang.org/x/sys v0.0.0-20200327173247-9dae0f8f5775 // indirect
	google.golang.org/genproto v0.0.0-20200326112834-f447254575fd // indirect
	google.golang.org/grpc v1.28.0
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
