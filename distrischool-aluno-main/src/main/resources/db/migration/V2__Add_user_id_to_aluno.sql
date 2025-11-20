-- Add user_id column to aluno table
ALTER TABLE aluno ADD COLUMN user_id BIGINT;
CREATE INDEX idx_aluno_user_id ON aluno(user_id);
