#!/bin/bash
go run ./cmd/main.go \
  --dev=true \
  --svc_address=localhost \
  --svc_port=8083 \
  --consul_address=consul.doqa.local \
  --consul_port=80
