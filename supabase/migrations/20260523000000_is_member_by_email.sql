-- Check if an email address belongs to an existing trip member.
-- Joins auth.users (service role only) so must be SECURITY DEFINER.
CREATE OR REPLACE FUNCTION is_trip_member_by_email(p_trip_id uuid, p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM trip_members tm
    JOIN auth.users u ON u.id = tm.user_id
    WHERE tm.trip_id = p_trip_id
      AND lower(u.email) = lower(p_email)
  );
$$;

REVOKE ALL ON FUNCTION is_trip_member_by_email(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_trip_member_by_email(uuid, text) TO authenticated;
