#!/bin/bash
go run ./cmd/main.go \
  --svc_address=localhost \
  --svc_port=8084 \
  --consul_address=consul.doqa.local \
  --consul_port=80
