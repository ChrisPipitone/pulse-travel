-- JAB-16: activities.added_by FK blocks user delete (GDPR right to be forgotten).
-- Change FK to ON DELETE SET NULL so deleting a user nullifies added_by
-- rather than blocking the delete. Activity data stays; attribution is cleared.

alter table public.activities alter column added_by drop not null;

alter table public.activities drop constraint activities_added_by_fkey;

alter table public.activities
  add constraint activities_added_by_fkey
  foreign key (added_by) references auth.users on delete set null;
