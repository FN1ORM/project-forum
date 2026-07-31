ALTER TABLE public.questions 
ADD COLUMN is_solved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN solved_at TIMESTAMPTZ NULL,
ADD COLUMN solved_by UUID NULL REFERENCES public.profiles(id);

-- Create the new policy allowing teachers and admins to update
CREATE POLICY "Teachers and admins can update questions"
  ON public.questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );
