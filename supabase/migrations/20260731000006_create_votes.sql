CREATE TABLE public.question_votes (
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, user_id)
);

ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read question votes" ON public.question_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own question vote" ON public.question_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own question vote" ON public.question_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.answer_votes (
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (answer_id, user_id)
);

ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read answer votes" ON public.answer_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own answer vote" ON public.answer_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own answer vote" ON public.answer_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);


