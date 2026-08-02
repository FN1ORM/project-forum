-- Migration 20260802000018_special_roles.sql
-- Assign roles to existing special accounts

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'fn1orm@gmail.com';

UPDATE public.profiles
SET role = 'teacher'
WHERE email = 'anuradha@iiitg.ac.in';
