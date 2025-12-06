-- Add user_id column to professores table
ALTER TABLE professores ADD COLUMN user_id BIGINT;
CREATE INDEX idx_professores_user_id ON professores(user_id);

-- Add user_id column to tecnicos_administrativos table
ALTER TABLE tecnicos_administrativos ADD COLUMN user_id BIGINT;
CREATE INDEX idx_tecnicos_administrativos_user_id ON tecnicos_administrativos(user_id);
