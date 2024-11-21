#!/bin/bash
go run ./cmd/main.go \
  --svc_address=http://localhost \
  --svc_port_http=8080 \
  --svc_port_grpc=8088 \
  --consul_address=consul.doqa.local \
  --consul_port=80
