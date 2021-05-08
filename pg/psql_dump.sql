CREATE TABLE rates (
  id serial PRIMARY KEY,
  protocol VARCHAR(40) NOT NULL,
  rate BIGINT NOT NULL,
  ts TIMESTAMP
)
