-- Drop the duplicate daily_goal_minutes column from user_settings.
-- The canonical home is public.users (UserSchema owns it in zod);
-- keeping it on user_settings as well would let the two copies drift.
ALTER TABLE public.user_settings
  DROP COLUMN daily_goal_minutes;
