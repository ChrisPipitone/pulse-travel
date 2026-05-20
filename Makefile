.PHONY: up down reset status logs studio types migration link push seed reseed clear

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

# ── Dev server ───────────────────────────────────────────────────────────────

dev:
	pnpm --filter=pulse-web dev
