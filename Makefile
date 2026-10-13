.PHONY: up down reset migrate status logs studio types migration link push seed reseed clear

PSQL := $(shell which psql 2>/dev/null || echo /opt/homebrew/opt/postgresql@15/bin/psql)
DB   := postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Auto-load supabase/.env so env() references in config.toml (e.g. Google OAuth
# credentials) are always available without manual sourcing.
-include supabase/.env
export

# ── Local Supabase (Docker) ──────────────────────────────────────────────────

up:
	@mkdir -p supabase/snippets
	supabase start

down:
	supabase stop

reset:
	supabase db reset

# ── Seed targets ─────────────────────────────────────────────────────────────

# Apply seed.sql to the running local DB (truncates first — safe to re-run)
seed:
	$(PSQL) $(DB) -f supabase/seed.sql

# Full reset: drop DB, replay migrations, run seed.sql (Supabase does this automatically)
reseed:
	supabase db reset

# Wipe all data rows, keep schema and activity_categories intact
clear:
	$(PSQL) $(DB) -c "truncate table trip_event_members, trip_events, activity_ratings, activities, trip_members, trips, profiles restart identity cascade; delete from auth.users;"

status:
	supabase status

logs:
	supabase logs

studio:
	@echo "Studio → http://localhost:54323"
	@xdg-open http://localhost:54323 2>/dev/null || true

# ── Migrations ───────────────────────────────────────────────────────────────

# Apply pending migrations to the running local DB without resetting data.
# Use this to apply new migration files without losing your current data.
# Use `make reset` if you want a full wipe + replay + seed.
migrate:
	supabase migration up

# Usage: make migration name=create_trips_table
migration:
	@test -n "$(name)" || (echo "Usage: make migration name=<migration_name>" && exit 1)
	supabase migration new $(name)

# ── Type generation ──────────────────────────────────────────────────────────

types:
	supabase gen types typescript --local > packages/types/src/supabase.gen.ts

# ── Remote (hosted Supabase) ─────────────────────────────────────────────────

# Usage: make link ref=<project-ref>
link:
	@test -n "$(ref)" || (echo "Usage: make link ref=<project-ref>" && exit 1)
	supabase link --project-ref $(ref)

push:
	supabase db push

# One-time demo template for the LINKED hosted project (make link first). Goes
# through the Management API, so it needs no DB password. Safe to re-run — it is
# a no-op once the template trip exists.
seed-prod:
	supabase db query --linked -f supabase/seed.prod.sql

# ── Dev server ───────────────────────────────────────────────────────────────

dev:
	pnpm --filter=pulse-web dev
