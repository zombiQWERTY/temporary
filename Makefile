.PHONY: up rebuild rebuild-one rebuild-all restart logs migrate reset reset-all generate

# Accepts "accounts", "core", etc
name ?= none

# Path to scripts inside the container
SCRIPT_PATH=/tmp

# Helper target to require name to be specified
require-name:
	@if [ "$(name)" = "none" ]; then \
		echo "Error: 'name' must be specified. Usage: make [target] name=<module_name>"; \
		exit 1; \
	fi

up:
	@echo "Running application in docker..."
	@docker build -t "erp-modul-dev:latest" -f ./infra/dev/Dockerfile .
	@docker compose --profile node --profile system up -d

rebuild:
	@echo "Rebuilding and running application in docker..."
	@docker build --cache-from "erp-modul-dev:latest" -t "erp-modul-dev:latest" -f ./infra/dev/Dockerfile .
	@docker compose --profile node up -d --build --force-recreate

rebuild-all:
	@echo "Rebuilding and running application in docker..."
	@docker build --cache-from "erp-modul-dev:latest" -t "erp-modul-dev:latest" -f ./infra/dev/Dockerfile .
	@docker compose --profile node --profile system up -d --build --force-recreate

rebuild-one: require-name
	@echo "Rebuilding and running application in docker for erp-modul.$(name)..."
	@docker build --cache-from "erp-modul-dev:latest" -t "erp-modul-dev:latest" -f ./infra/dev/Dockerfile .
	@docker compose up erp-modul.$(name) -d --build --force-recreate

restart:
	@echo "Rebuilding and running application in docker..."
	@docker compose --profile node up -d --force-recreate

logs: require-name
	@echo "Watching logs for erp-modul.$(name)..."
	@docker logs --follow erp-modul.$(name)

generate: require-name
	@echo "Running migration script for erp-modul.$(name)..."
	@docker exec -ti erp-modul.$(name) $(SCRIPT_PATH)/generate.sh

migrate: require-name
	@echo "Running migration script for erp-modul.$(name)..."
	@docker exec -ti erp-modul.$(name) $(SCRIPT_PATH)/migrate.sh

reset: require-name
	@echo "Running reset script for erp-modul.$(name)..."
	@docker exec erp-modul.$(name) $(SCRIPT_PATH)/reset.sh

reset-all:
	@echo "Running reset script for erp-modul..."
	@docker exec erp-modul.core $(SCRIPT_PATH)/reset.sh
	@docker exec erp-modul.files $(SCRIPT_PATH)/reset.sh
	@docker exec erp-modul.accounts $(SCRIPT_PATH)/reset.sh
	@docker exec erp-modul.products_tm $(SCRIPT_PATH)/reset.sh
