-- Add moderation flags
ALTER TABLE public.questions ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.answers ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT false;

-- Create Reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_id UUID NULL REFERENCES public.answers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('Spam', 'Harassment', 'Offensive Content', 'Wrong Subject', 'Other')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure exactly one target exists
    CONSTRAINT check_single_target CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR
        (question_id IS NULL AND answer_id IS NOT NULL)
    ),
    -- Require description if reason is 'Other'
    CONSTRAINT check_description_for_other CHECK (
        (reason != 'Other') OR (reason = 'Other' AND description IS NOT NULL AND trim(description) != '')
    )
);

-- Prevent duplicate reports at the database level
CREATE UNIQUE INDEX idx_unique_question_report ON public.reports(reporter_id, question_id) WHERE question_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_answer_report ON public.reports(reporter_id, answer_id) WHERE answer_id IS NOT NULL;

-- Enable RLS for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reports" ON public.reports 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = reporter_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

CREATE POLICY "Admins can read reports" ON public.reports 
FOR SELECT TO authenticated 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update reports" ON public.reports 
FOR UPDATE TO authenticated 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Update Questions SELECT Policy (Hidden logic)
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;
CREATE POLICY "Authenticated users can read questions" ON public.questions 
FOR SELECT TO authenticated 
USING (is_hidden = false OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Update Answers SELECT Policy (Hidden logic)
DROP POLICY IF EXISTS "Authenticated users can read answers" ON public.answers;
CREATE POLICY "Authenticated users can read answers" ON public.answers 
FOR SELECT TO authenticated 
USING (is_hidden = false OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Update Questions Write Policies (Suspended logic)
DROP POLICY IF EXISTS "Authenticated users can insert own questions" ON public.questions;
CREATE POLICY "Authenticated users can insert own questions" ON public.questions 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

DROP POLICY IF EXISTS "Only the author can update their own questions" ON public.questions;
CREATE POLICY "Only the author can update their own questions" ON public.questions 
FOR UPDATE TO authenticated 
USING (auth.uid() = author_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

-- Update Answers Write Policies (Suspended logic)
DROP POLICY IF EXISTS "Authenticated users can insert own answers" ON public.answers;
CREATE POLICY "Authenticated users can insert own answers" ON public.answers 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

DROP POLICY IF EXISTS "Only the author can update their own answers" ON public.answers;
CREATE POLICY "Only the author can update their own answers" ON public.answers 
FOR UPDATE TO authenticated 
USING (auth.uid() = author_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

-- Update Question Votes (Suspended logic)
DROP POLICY IF EXISTS "Users can insert own question vote" ON public.question_votes;
CREATE POLICY "Users can insert own question vote" ON public.question_votes 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

-- Update Answer Votes (Suspended logic)
DROP POLICY IF EXISTS "Users can insert own answer vote" ON public.answer_votes;
CREATE POLICY "Users can insert own answer vote" ON public.answer_votes 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND auth.uid() NOT IN (SELECT id FROM profiles WHERE is_suspended = true));

-- Helper functions for 404 bypass in Next.js Server Components
CREATE OR REPLACE FUNCTION check_question_hidden_status(q_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  hidden BOOLEAN;
BEGIN
  SELECT is_hidden INTO hidden FROM public.questions WHERE id = q_id;
  RETURN hidden;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_answer_hidden_status(a_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  hidden BOOLEAN;
BEGIN
  SELECT is_hidden INTO hidden FROM public.answers WHERE id = a_id;
  RETURN hidden;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
