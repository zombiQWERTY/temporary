module bitbucket.org/ittinc/landing-service

go 1.14

require (
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200229135543-c02eb4432c1a
	bitbucket.org/ittinc/tenants-service/tenants_grpc v0.0.0-20200229140424-2e12bc10e463
	bitbucket.org/ittinc/users-service/users_grpc v0.0.0-20200229140424-a40026ea8f39
	emperror.dev/errors v0.5.2
	github.com/armon/go-metrics v0.3.2 // indirect
	github.com/asaskevich/govalidator v0.0.0-20190424111038-f61b66f89f4a
	github.com/go-chi/chi v4.0.3+incompatible
	github.com/go-kit/kit v0.9.0
	github.com/golang/protobuf v1.3.4 // indirect
	github.com/hashicorp/consul/api v1.4.0 // indirect
	github.com/hashicorp/go-immutable-radix v1.1.0 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/serf v0.8.5 // indirect
	github.com/mattn/go-colorable v0.1.6 // indirect
	github.com/sirupsen/logrus v1.4.2
	go.uber.org/multierr v1.3.0 // indirect
	golang.org/x/crypto v0.0.0-20191219195013-becbf705a915 // indirect
	golang.org/x/net v0.0.0-20200226121028-0de0cce0169b // indirect
	google.golang.org/genproto v0.0.0-20200228133532-8c2c7df3a383 // indirect
	google.golang.org/grpc v1.27.1
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
