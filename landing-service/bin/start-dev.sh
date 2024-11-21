#!/bin/bash
go run ./cmd/main.go --svc_address=http://host.docker.internal --svc_port=8087 --consul_address=consul.doqa.local --consul_port=80
