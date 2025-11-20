-- Add curso_id and turma_id columns to aluno table
ALTER TABLE aluno ADD COLUMN curso_id BIGINT;
ALTER TABLE aluno ADD COLUMN turma_id BIGINT;

-- Drop the old turma text column if it exists and replace with turma_id relationship
ALTER TABLE aluno DROP COLUMN IF EXISTS turma;
