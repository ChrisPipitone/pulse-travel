.PHONY: up down reset status logs studio types migration link push

# ── Local Supabase (Docker) ──────────────────────────────────────────────────

up:
	@mkdir -p supabase/snippets
	supabase start

down:
	supabase stop

reset:
	supabase db reset

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
