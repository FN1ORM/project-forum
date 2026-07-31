CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read answers"
  ON public.answers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own answers"
  ON public.answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only the author can update their own answers"
  ON public.answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only the author can delete their own answers"
  ON public.answers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
