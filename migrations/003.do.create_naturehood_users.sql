CREATE TABLE naturehood_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    fullname text NOT NULL,
    email VARCHAR(320) NOT NULL,
    password text NOT NULL,
    zipcode VARCHAR(5) NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE observations
  ADD COLUMN
    neighbor INTEGER REFERENCES naturehood_users(id)
    ON DELETE SET NULL;