#!/bin/bash
go run ./cmd/main.go \
  --svc_address=http://localhost \
  --svc_port_http=8081 \
  --svc_port_grpc=8085 \
  --consul_address=consul.doqa.local \
  --consul_port=80
