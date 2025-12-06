-- Create matricula_disciplina table for student enrollments
CREATE TABLE matricula_disciplina (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    disciplina_id BIGINT NOT NULL,
    data_matricula TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ATIVO',
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    UNIQUE (aluno_id, disciplina_id)
);

-- Create index for faster lookups
CREATE INDEX idx_matricula_aluno ON matricula_disciplina(aluno_id);
CREATE INDEX idx_matricula_disciplina ON matricula_disciplina(disciplina_id);
