-- Rename MEH → MAYBE (matches display label, clearer intent)
ALTER TYPE rating RENAME VALUE 'MEH' TO 'MAYBE';
-- Add SKIP as explicit 4th tier (not joining this activity)
ALTER TYPE rating ADD VALUE IF NOT EXISTS 'SKIP';
