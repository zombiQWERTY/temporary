# ERPModul Monorepo

### Start services in dev mode:

1. Provide .env (see env.sample)
2. make up (node_modules will be installed in containers and binds to local fs)
3. To connect logs into terminal use docker logs --follow erp-modul.<service name suffix>

### Microservices

* Core - provides auth, roles, users, branches interactions
* Audit_log - accepts all audit logs from every service
* Alert - provides OTP confirmations through sms and email codes and send raw emails
* Files - interactions with files
* Accounts - interactions with client accounts

### Additional information
* Stateful PostgreSQL services uses separated database schemas

### Server infrastructure
* Krakend as Api Gateway

### Create new microservice
1. Generate automatically new app: `$ nest generate app` (it adds new section into `nest-cli.json` and makes proper `tsconfig.app.json` in new service)
2. Add new item to `SERVICE HOSTS` into `.env` and `env.sample`:
`SERVICE_NAME_UPPER_SNAKE_CASE_APP_HOST=erp-modul.serviceNameCamelCase`
3. Add `PostgreSQL` **schema** and **connection** string if needed into `.env` and `env.sample`
4. Add new `erp-modul.krakend => environment` line into `docker-compose.dev.yml`
5. Add new service into `docker-compose.dev.yml`
6. Add new template related to new service into `infra/krakend/templates` (if new service provides REST interface)
7. Connect template from step 6 into `infra/krakend/krakend.tmpl => endpoints`
8. Restart application: `$ make rebuild`
