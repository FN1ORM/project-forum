CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: The UNIQUE constraint on 'slug' creates an implicit unique index in Postgres, ensuring optimized lookups by slug.

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read subjects"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.subjects (name, slug)
VALUES ('Mathematics', 'mathematics')
ON CONFLICT (slug) DO NOTHING;
