-- Create cursos table
CREATE TABLE cursos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(1000),
    duracao_semestres INTEGER NOT NULL
);

-- Create turmas table
CREATE TABLE turmas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    curso_id BIGINT NOT NULL,
    ano INTEGER NOT NULL,
    semestre INTEGER NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- Create disciplinas table
CREATE TABLE disciplinas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(1000),
    turma_id BIGINT NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- Create disciplina_professor junction table
CREATE TABLE disciplina_professor (
    disciplina_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    PRIMARY KEY (disciplina_id, professor_id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES professores(id)
);
