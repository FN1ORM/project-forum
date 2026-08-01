-- Enable trigram extension for efficient wildcard matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fast ILIKE '%term%' matching
CREATE INDEX IF NOT EXISTS questions_title_trgm_idx ON public.questions USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS questions_body_trgm_idx ON public.questions USING GIN (body gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_display_name_trgm_idx ON public.profiles USING GIN (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS subjects_name_trgm_idx ON public.subjects USING GIN (name gin_trgm_ops);

-- Create the search function
-- We use SECURITY INVOKER so that it runs with the privileges of the caller.
-- This ensures that any existing or future Row Level Security (RLS) policies
-- (e.g., hiding questions for moderation) are automatically and strictly enforced.
CREATE OR REPLACE FUNCTION public.search_questions(
  search_term TEXT,
  page_number INT,
  page_size INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ,
  subject_id UUID,
  subject_slug TEXT,
  subject_name TEXT,
  author_id UUID,
  author_display_name TEXT,
  is_solved BOOLEAN,
  solved_at TIMESTAMPTZ,
  solved_by UUID,
  solver_display_name TEXT,
  vote_count BIGINT,
  total_count BIGINT
) 
SECURITY INVOKER
AS $$
DECLARE
  calc_offset INT;
  like_term TEXT;
BEGIN
  -- page_number is 1-indexed
  calc_offset := (GREATEST(page_number, 1) - 1) * GREATEST(page_size, 1);
  like_term := '%' || search_term || '%';

  RETURN QUERY
  SELECT 
    q.id,
    q.title,
    q.body,
    q.created_at,
    q.subject_id,
    s.slug AS subject_slug,
    s.name AS subject_name,
    q.author_id,
    p.display_name AS author_display_name,
    q.is_solved,
    q.solved_at,
    q.solved_by,
    sp.display_name AS solver_display_name,
    COALESCE(qv.vote_count, 0) AS vote_count,
    COUNT(*) OVER() AS total_count
  FROM public.questions q
  JOIN public.subjects s ON s.id = q.subject_id
  JOIN public.profiles p ON p.id = q.author_id
  LEFT JOIN public.profiles sp ON sp.id = q.solved_by
  LEFT JOIN (
    SELECT question_id, COUNT(*) AS vote_count
    FROM public.question_votes
    GROUP BY question_id
  ) qv ON qv.question_id = q.id
  WHERE 
    q.title ILIKE like_term OR
    q.body ILIKE like_term OR
    p.display_name ILIKE like_term OR
    s.name ILIKE like_term
  ORDER BY q.created_at DESC
  LIMIT page_size
  OFFSET calc_offset;
END;
$$ LANGUAGE plpgsql;
