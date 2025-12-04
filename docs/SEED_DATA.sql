-- Seed Data for DistriSchool Testing
-- Run this SQL script after deploying all services to populate test data

-- ========================================
-- 1. CREATE TEST COURSES
-- ========================================
INSERT INTO cursos (nome, descricao, duracao_semestres) VALUES
('Ciência da Computação', 'Bacharelado em Ciência da Computação', 8),
('Engenharia de Software', 'Bacharelado em Engenharia de Software', 8),
('Sistemas de Informação', 'Bacharelado em Sistemas de Informação', 8);

-- ========================================
-- 2. CREATE TEST CLASSES (TURMAS)
-- ========================================
-- Classes for Ciência da Computação (curso_id = 1)
INSERT INTO turmas (nome, curso_id, ano, semestre) VALUES
('CC-2024-1', 1, 2024, 1),
('CC-2024-2', 1, 2024, 2),
('CC-2025-1', 1, 2025, 1);

-- Classes for Engenharia de Software (curso_id = 2)
INSERT INTO turmas (nome, curso_id, ano, semestre) VALUES
('ES-2024-1', 2, 2024, 1),
('ES-2024-2', 2, 2024, 2);

-- Classes for Sistemas de Informação (curso_id = 3)
INSERT INTO turmas (nome, curso_id, ano, semestre) VALUES
('SI-2024-1', 3, 2024, 1),
('SI-2024-2', 3, 2024, 2);

-- ========================================
-- 3. CREATE TEST PROFESSORS (if not exist)
-- ========================================
-- Note: Adjust professor IDs based on your existing data
-- These are examples - you may need to create professors via user service first

-- Example: If you already have professors, skip this section
-- INSERT INTO professores (nome, email, especialidade, data_contratacao) VALUES
-- ('Prof. Carlos Silva', 'carlos.silva@escola.com', 'Algoritmos', '2020-01-15'),
-- ('Prof. Ana Costa', 'ana.costa@escola.com', 'Banco de Dados', '2019-06-01'),
-- ('Prof. Roberto Santos', 'roberto.santos@escola.com', 'Redes de Computadores', '2021-03-10');

-- ========================================
-- 4. CREATE TEST DISCIPLINES
-- ========================================
-- Disciplines for CC-2024-1 (turma_id = 1)
-- Note: Adjust professor_id values to match your actual professor IDs
INSERT INTO disciplinas (nome, descricao, turma_id) VALUES
('Algoritmos e Estruturas de Dados', 'Introdução a algoritmos e estruturas de dados fundamentais', 1),
('Programação Orientada a Objetos', 'Conceitos e práticas de POO', 1),
('Banco de Dados I', 'Fundamentos de banco de dados relacionais', 1);

-- Disciplines for CC-2024-2 (turma_id = 2)
INSERT INTO disciplinas (nome, descricao, turma_id) VALUES
('Estruturas de Dados Avançadas', 'Estruturas de dados complexas', 2),
('Banco de Dados II', 'Banco de dados avançado', 2),
('Engenharia de Software I', 'Princípios de engenharia de software', 2);

-- Disciplines for ES-2024-1 (turma_id = 4)
INSERT INTO disciplinas (nome, descricao, turma_id) VALUES
('Requisitos de Software', 'Análise e especificação de requisitos', 4),
('Arquitetura de Software', 'Padrões e arquiteturas de software', 4),
('Testes de Software', 'Técnicas de teste e qualidade', 4);

-- ========================================
-- 5. ASSOCIATE PROFESSORS TO DISCIPLINES
-- ========================================
-- Note: Adjust IDs based on your actual data
-- Example associations (assuming professor IDs 1, 2, 3 exist)
-- INSERT INTO disciplina_professor (disciplina_id, professor_id) VALUES
-- (1, 1), -- Algoritmos -> Prof. Carlos
-- (2, 1), -- POO -> Prof. Carlos
-- (3, 2), -- Banco de Dados I -> Prof. Ana
-- (4, 1), -- Estruturas Avançadas -> Prof. Carlos
-- (5, 2), -- Banco de Dados II -> Prof. Ana
-- (6, 3), -- Eng. Software I -> Prof. Roberto
-- (7, 3), -- Requisitos -> Prof. Roberto
-- (8, 3), -- Arquitetura -> Prof. Roberto
-- (9, 3); -- Testes -> Prof. Roberto

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Uncomment to run these queries to verify the data

-- SELECT * FROM cursos;
-- SELECT * FROM turmas;
-- SELECT * FROM disciplinas;
-- SELECT d.id, d.nome, t.nome as turma, c.nome as curso 
--   FROM disciplinas d 
--   JOIN turmas t ON d.turma_id = t.id 
--   JOIN cursos c ON t.curso_id = c.id;

-- ========================================
-- NOTES FOR TESTING
-- ========================================
-- 1. Create users via the frontend using the User Management page
-- 2. When creating students, you'll now be able to select from these courses and classes
-- 3. When creating grades, you'll be able to select from these disciplines
-- 4. The student dropdown will automatically filter based on the selected discipline's class

-- Example test flow:
-- 1. Login as admin
-- 2. Create a student and assign to "Ciência da Computação" and "CC-2024-1"
-- 3. Go to Grades page
-- 4. Select discipline "Algoritmos e Estruturas de Dados"
-- 5. Student dropdown should show only students in CC-2024-1
-- 6. Submit grade
-- 7. Login as that student and check notifications
