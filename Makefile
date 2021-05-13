### Client
client_start:
	cd client && npm install && npm run start

client_docker_build:
	cd client && docker build . -t client:latest

client_docker_up: client_docker_build
	docker run -p 8080:80 --name=dsr-client -d client:latest

client_docker_down:
	docker rm dsr-client --force || true
###

### API
api_start:
	cd api && npm install && npm run start

api_docker_build:
	cd api && docker build . -t api:latest

api_docker_up: api_docker_build
	docker run -p 8000:8000 --name=dsr-api -d api:latest

api_docker_down:
	docker rm dsr-api --force || true
###

### PG
pg_up: pg_down
	cd pg && docker build -f Dockerfile . -t dsr_pg:latest
	docker run --name=dsr_pg\
		-e POSTGRES_DB=rates \
		-e POSTGRES_PASSWORD=dsr \
		-p 5432:5432 \
		-d \
		rates:latest

pg_down:
	docker rm dsr_pg --force || true

pg_connect:
	export PGPASSWORD=dsr && \
	psql -h localhost -p 5432 -d rates -U postgres
###

load_rates:
	node scripts/load-historical.js
