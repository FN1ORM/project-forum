ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT NOT NULL DEFAULT '';

-- Backfill from auth.users metadata if available, otherwise email prefix
UPDATE public.profiles p
SET display_name = COALESCE(
  NULLIF(u.raw_user_meta_data->>'full_name', ''),
  NULLIF(u.raw_user_meta_data->>'name', ''),
  split_part(p.email, '@', 1)
)
FROM auth.users u
WHERE p.id = u.id AND p.display_name = '';
