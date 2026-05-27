-- Remove WANT from the rating enum (JAB-82).
-- Frontend dropped WANT in favour of MAYBE. DB still carries the value.
--
-- Postgres doesn't support ALTER TYPE ... DROP VALUE, so we:
--   1. Migrate all WANT rows → MAYBE
--   2. Cast the column to text (breaks the enum dependency)
--   3. Drop the old enum
--   4. Recreate it with only MUST, MAYBE, SKIP
--   5. Cast the column back

-- Step 1 — data migration
UPDATE activity_ratings SET rating = 'MAYBE' WHERE rating = 'WANT';

-- Step 2 — detach column from enum
ALTER TABLE activity_ratings
  ALTER COLUMN rating TYPE text;

-- Step 3 — drop old enum (all dependents now detached)
DROP TYPE rating;

-- Step 4 — create clean enum
CREATE TYPE rating AS ENUM ('MUST', 'MAYBE', 'SKIP');

-- Step 5 — reattach column
ALTER TABLE activity_ratings
  ALTER COLUMN rating TYPE rating USING rating::rating;
