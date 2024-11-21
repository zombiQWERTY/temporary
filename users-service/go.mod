module bitbucket.org/ittinc/users-service

go 1.14

require (
	bitbucket.org/ittinc/auth-service/auth_grpc v0.0.0-20200229140606-522dd64771e4
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200420123828-7b3d3a45ab07
	bitbucket.org/ittinc/mailer-service/mailer_grpc v0.0.0-20200229140424-39066f4f3162
	bitbucket.org/ittinc/signal-service/signal_grpc v0.0.0-20200229140424-701a6abfccb6
	bitbucket.org/ittinc/tenants-service/tenants_grpc v0.0.0-20200229140424-2e12bc10e463
	bitbucket.org/ittinc/users-service/users_grpc v0.0.0-20200401151356-8e0f81f3881c
	emperror.dev/errors v0.5.2
	github.com/armon/go-metrics v0.3.3 // indirect
	github.com/asaskevich/govalidator v0.0.0-20190424111038-f61b66f89f4a
	github.com/go-chi/chi v4.0.3+incompatible
	github.com/go-kit/kit v0.9.0
	github.com/go-redis/redis/v7 v7.0.0-beta.5
	github.com/golang/protobuf v1.3.5 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.1.0
	github.com/hashicorp/consul/api v1.4.0 // indirect
	github.com/hashicorp/go-hclog v0.12.2 // indirect
	github.com/hashicorp/go-immutable-radix v1.2.0 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/serf v0.9.0 // indirect
	github.com/jinzhu/gorm v1.9.12
	github.com/mattn/go-colorable v0.1.6 // indirect
	github.com/mitchellh/mapstructure v1.2.2 // indirect
	github.com/segmentio/ksuid v1.0.2
	github.com/sirupsen/logrus v1.5.0
	github.com/urfave/cli/v2 v2.0.0
	go.uber.org/multierr v1.3.0 // indirect
	golang.org/x/crypto v0.0.0-20191219195013-becbf705a915
	golang.org/x/net v0.0.0-20200324143707-d3edc9973b7e // indirect
	golang.org/x/sys v0.0.0-20200331124033-c3d80250170d // indirect
	google.golang.org/genproto v0.0.0-20200401122417-09ab7b7031d2 // indirect
	google.golang.org/grpc v1.28.0
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
