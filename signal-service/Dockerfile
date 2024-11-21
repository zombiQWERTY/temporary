FROM golang:alpine as builder

LABEL maintainer="Pavel Zinovev <zinovev@ittest-team.ru>"

WORKDIR /builder

ARG GOPRIVATE
ARG DOCKER_GIT_CREDENTIALS

RUN apk add --no-cache git \
 && git config --global credential.helper store && echo "${DOCKER_GIT_CREDENTIALS}" > ~/.git-credentials

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o app ./cmd/main.go


FROM alpine

COPY --from=builder /builder/app .

EXPOSE 8080

RUN chmod +x ./app

ENTRYPOINT ["./app", \
               "--svc_address", "http://signal_service", "--svc_port_http", "8080", "--svc_port_grpc", "8088", \
               "--consul_address", "consul", "--consul_port", "8500"]
