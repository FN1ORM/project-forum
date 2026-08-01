CREATE OR REPLACE FUNCTION question_vote_count(questions) RETURNS BIGINT AS $$
  SELECT COUNT(user_id) FROM public.question_votes WHERE question_id = $1.id;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION question_answer_count(questions) RETURNS BIGINT AS $$
  SELECT COUNT(id) FROM public.answers WHERE question_id = $1.id;
$$ LANGUAGE SQL STABLE;
