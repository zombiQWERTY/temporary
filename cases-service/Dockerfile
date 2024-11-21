FROM golang:alpine as builder

LABEL maintainer="Pavel Zinovev <zinovev@ittest-team.ru>"

WORKDIR /builder

ARG GOPRIVATE
ARG DOCKER_GIT_CREDENTIALS

RUN apk add --no-cache git \
 && git config --global credential.helper store && echo "${DOCKER_GIT_CREDENTIALS}" > ~/.git-credentials

RUN git clone https://bitbucket.org/ittinc/migrations-package.git /migrations-package

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o app ./cmd/main.go

FROM alpine

COPY --from=builder /builder/app .
COPY --from=migrate/migrate /migrate .
COPY --from=migrate/migrate /lib /lib
COPY --from=builder /migrations-package /migrations-package

EXPOSE 8080

RUN chmod +x ./app
RUN chmod +x ./migrate

ENTRYPOINT ["./app", \
                "--svc_address", "http://cases_service", "--svc_port_http", "8080", "--svc_port_grpc", "8088", \
                "--consul_address", "consul", "--consul_port", "8500"]
