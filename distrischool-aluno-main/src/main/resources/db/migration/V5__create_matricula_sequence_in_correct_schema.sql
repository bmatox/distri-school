-- V5: Create matricula_seq in the correct schema (aluno_schema)
-- This fixes the issue where V4 attempted to create it in the wrong schema
DROP SEQUENCE IF EXISTS public.matricula_seq;
CREATE SEQUENCE IF NOT EXISTS aluno_schema.matricula_seq START 1;
