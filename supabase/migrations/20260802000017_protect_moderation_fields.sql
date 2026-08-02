-- Migration 20260802000017_protect_moderation_fields.sql

-- 1. Protect Profiles Table
DROP TRIGGER IF EXISTS ensure_profile_fields_protected ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Allow privileged database roles (e.g., Supabase Dashboard, Service Role) to bypass checks
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Retrieve the caller's role from their profile
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  -- Admins bypass these checks
  IF caller_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- For non-admins, reject changes to restricted columns
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Unauthorized to modify role';
  END IF;

  IF NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
    RAISE EXCEPTION 'Unauthorized to modify suspension status';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ensure_profile_fields_protected
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();


-- 2. Protect Content Tables (Questions & Answers)
DROP TRIGGER IF EXISTS ensure_question_moderation_protected ON public.questions;
DROP TRIGGER IF EXISTS ensure_answer_moderation_protected ON public.answers;
DROP FUNCTION IF EXISTS public.protect_content_moderation_fields();

CREATE OR REPLACE FUNCTION public.protect_content_moderation_fields()
RETURNS trigger AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Allow privileged database roles (e.g., Supabase Dashboard, Service Role) to bypass checks
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- If moderation fields aren't being changed, allow the update to proceed
  IF NEW.is_hidden IS NOT DISTINCT FROM OLD.is_hidden THEN
    RETURN NEW;
  END IF;

  -- If they are being changed, verify the caller's role
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  
  IF caller_role IN ('admin', 'teacher') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized to modify moderation fields';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ensure_question_moderation_protected
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.protect_content_moderation_fields();

CREATE TRIGGER ensure_answer_moderation_protected
BEFORE UPDATE ON public.answers
FOR EACH ROW EXECUTE FUNCTION public.protect_content_moderation_fields();
