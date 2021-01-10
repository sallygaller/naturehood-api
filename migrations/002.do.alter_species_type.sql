CREATE TYPE species_type AS ENUM (
    'Mammal', 
    'Bird', 
    'Arthropod', 
    'Amphibian', 
    'Reptile', 
    'Fish'
);

ALTER TABLE observations
  ADD COLUMN
    type species_type;