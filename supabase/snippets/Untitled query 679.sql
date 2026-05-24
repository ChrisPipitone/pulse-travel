-- insert into profiles (id, display_name) values ('df010619-eb9d-493f-9234-058b6b1e7a45', 'Chris') on conflict (id) do update set display_name = excluded.display_name;


-- insert into trip_members (trip_id, user_id, joined_at)
--   values (
--     'aaaaaaaa-0000-0000-0000-000000000001',
--     'df010619-eb9d-493f-9234-058b6b1e7a45',
--     now()
--   )
--   on conflict do nothing;


-- select id, email from auth.users order by created_at desc limit 10;

--  select * from trip_members
--   where trip_id = 'aaaaaaaa-0000-0000-0000-000000000001'
--   order by joined_at desc;

-- select id, name from activities where trip_id = 'aaaaaaaa-0000-0000-0000-000000000001';
