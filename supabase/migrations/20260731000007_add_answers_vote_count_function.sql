CREATE OR REPLACE FUNCTION vote_count(answers) RETURNS BIGINT AS $$
  SELECT COUNT(user_id) FROM public.answer_votes WHERE answer_id = $1.id;
$$ LANGUAGE SQL STABLE;
