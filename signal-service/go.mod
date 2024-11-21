module bitbucket.org/ittinc/signal-service

go 1.14

require (
	bitbucket.org/ittinc/auth-service/auth_grpc v0.0.0-20200229140606-522dd64771e4
	bitbucket.org/ittinc/go-shared-packages v0.0.0-20200229135543-c02eb4432c1a
	bitbucket.org/ittinc/signal-service/signal_grpc v0.0.0-20200229000623-f85a19cf04a1
	github.com/armon/go-metrics v0.3.2 // indirect
	github.com/go-chi/chi v4.0.3+incompatible
	github.com/go-kit/kit v0.9.0
	github.com/golang/protobuf v1.3.4 // indirect
	github.com/gorilla/websocket v1.4.1
	github.com/grpc-ecosystem/go-grpc-middleware v1.2.0
	github.com/hashicorp/consul/api v1.4.0 // indirect
	github.com/hashicorp/go-immutable-radix v1.1.0 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/serf v0.8.5 // indirect
	github.com/mattn/go-colorable v0.1.6 // indirect
	github.com/sirupsen/logrus v1.4.2
	golang.org/x/crypto v0.0.0-20191206172530-e9b2fee46413 // indirect
	golang.org/x/net v0.0.0-20200226121028-0de0cce0169b // indirect
	google.golang.org/genproto v0.0.0-20200228133532-8c2c7df3a383 // indirect
	google.golang.org/grpc v1.27.1
)

// replace bitbucket.org/ittinc/go-shared-packages => ../go-shared-packages
