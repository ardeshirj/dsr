### API
api_start:
	source .env && \
	cd api && \
	npm install && npm run start

api_docker_build:
	cd api && docker build . -t api:latest

api_docker_up: api_docker_build
	docker run -p 8000:8000 --name=dsr-api -d dsr_api:latest

api_docker_down:
	docker rm dsr-api --force || true
###

### PG
pg_up: pg_down
	cd pg && docker build . -t dsr_pg:latest
	source .env && \
	docker run --name=dsr_pg \
		-e POSTGRES_DB=$${PG_DATABASE} \
		-e POSTGRES_PASSWORD=$${PG_PASSWORD} \
		-p 5432:5432 \
		-d \
		dsr_pg:latest

pg_down:
	docker rm dsr_pg --force || true

pg_connect:
	source .env && \
	export PGPASSWORD=$${PG_PASSWORD} && \
	psql -h $${PG_HOST} -p 5432 -d $${PG_DATABASE} -U $${PG_USER}
###

### Client
client_start:
	source .env && \
	cd client && \
	npm install && \
	npm run start

client_docker_build:
	cd client && docker build . -t dsr_client:latest

client_docker_up: client_docker_build
	docker run -p 8080:80 --name=dsr-client -d client:latest

client_docker_down:
	docker rm dsr-client --force || true
###

### Scripts
scripts_docker_build:
	cd scripts && docker build . -t dsr_scripts:latest

scripts_docker_run: scripts_docker_build
	docker run --name="dsr_scripts" dsr_scripts:latest

scripts_docker_down:
	docker rm dsr_scripts --force || true

scripts_load_rates: pg_up
	source .env && \
	node scripts/load-historical.js

scripts_load_random_rates: pg_up
	source .env && \
	node scripts/load-random-historical.js
###

### Docker Compose
docker_compose_down:
	docker compose down

docker_compose_build: docker_compose_down
	docker compose build

docker_compose_up: docker_compose_build
	docker compose --env-file .env.docker up

run: docker_compose_up
###
