pg_up: pg_down
	cd pg && docker build -f Dockerfile . -t rates:latest
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
