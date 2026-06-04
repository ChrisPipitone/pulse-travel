-- JAB-56 F5: enforce the invite code at the data layer.
-- Previously trip_members INSERT only checked user_id = auth.uid(), so any
-- authenticated user could join any trip by its UUID — the invite code was only
-- ever checked client-side. Now:
--   * non-owners join ONLY via join_trip_by_invite_code(code), which verifies
--     the code server-side (SECURITY DEFINER bypasses RLS to insert);
--   * direct trip_members INSERT is restricted to owner self-add (the createTrip
--     path, where the creator adds themselves to a trip they own).
-- Makes the invite code the real access gate and unblocks invite
-- expiry / lock / regenerate features later.

create function public.join_trip_by_invite_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id from trips where invite_code = p_code limit 1;
  if v_trip_id is null then
    return null;  -- invalid / unknown code
  end if;

  -- Already a member: no-op. Re-clicking the link is success, not an error,
  -- and this avoids a false member-limit trigger error when the trip is at cap.
  if exists (
    select 1 from trip_members where trip_id = v_trip_id and user_id = auth.uid()
  ) then
    return v_trip_id;
  end if;

  -- BEFORE INSERT trigger enforce_trip_member_limit still fires here (tier cap).
  insert into trip_members (trip_id, user_id) values (v_trip_id, auth.uid());
  return v_trip_id;
end;
$$;

revoke all on function public.join_trip_by_invite_code(text) from public;
-- Supabase default privileges auto-grant EXECUTE to anon on new functions;
-- revoke-from-public does not strip that explicit grant. Must revoke anon
-- explicitly (same pattern as get_trip_by_invite_code). Joining requires a
-- signed-in user — anon has no business calling this.
revoke execute on function public.join_trip_by_invite_code(text) from anon;
grant execute on function public.join_trip_by_invite_code(text) to authenticated;

-- Restrict direct INSERT to owner self-add. Everyone else joins via the function.
drop policy if exists "trip_members: insert self" on trip_members;
create policy "trip_members: owner self-add"
  on trip_members for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from trips
      where trips.id = trip_members.trip_id
        and trips.created_by = (select auth.uid())
    )
  );
