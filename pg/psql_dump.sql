CREATE TABLE rates (
  id serial PRIMARY KEY,
  protocol VARCHAR(40) NOT NULL,
  apy REAL NOT NULL,
  ts BIGINT
)
