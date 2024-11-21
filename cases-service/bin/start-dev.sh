#!/bin/bash
go run ./cmd/main.go \
  --svc_address=localhost \
  --svc_port_http=8091 \
  --svc_port_grpc=8092 \
  --consul_address=consul.doqa.local \
  --consul_port=80
