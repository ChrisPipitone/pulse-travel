-- Auto-create a profiles row whenever a user is created in auth.users.
-- Covers all sign-in methods: email+password, OTP, Google OAuth.
--
-- display_name resolution order:
--   1. raw_user_meta_data->>'full_name'  — Google OAuth
--   2. raw_user_meta_data->>'name'       — some other providers
--   3. email prefix before '@'           — fallback for email-only sign-ups
--
-- ON CONFLICT DO NOTHING — safe to run even if a profile row already exists
-- (e.g. seeded users, or manual inserts during dev).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
