CREATE TABLE rates (
  id serial PRIMARY KEY,
  protocol VARCHAR(40) NOT NULL,
  rate DOUBLE PRECISION NOT NULL,
  ts TIMESTAMP
)
