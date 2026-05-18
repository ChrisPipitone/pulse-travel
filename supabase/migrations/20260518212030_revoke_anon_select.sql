-- Revoke SELECT from the anon role on all public tables.
--
-- Why: Supabase exposes a GraphQL endpoint (pg_graphql) in addition to the
-- REST API (PostgREST). Default Postgres grants allow the anon role to see
-- table names via GraphQL schema introspection even when RLS blocks the rows.
-- This app requires authentication for all data access, so anon should have
-- no visibility into the schema at all.
--
-- Impact on REST API: PostgREST uses a separate authenticator role for schema
-- introspection so this does not break API generation. Unauthenticated REST
-- requests correctly receive a permission denied error.
--
-- The authenticated role retains SELECT grants (required for PostgREST).
-- GraphQL warnings for authenticated are acceptable: RLS restricts row access,
-- table names are not sensitive, and this app does not use the GraphQL endpoint.

revoke select on all tables in schema public from anon;
