-- Add turma_id column to professores table
ALTER TABLE professores ADD COLUMN turma_id BIGINT;

-- Add foreign key constraint
ALTER TABLE professores ADD CONSTRAINT fk_professor_turma 
    FOREIGN KEY (turma_id) REFERENCES turmas(id);
