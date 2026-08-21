ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON public.users(auth_user_id);
GRANT SELECT ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;