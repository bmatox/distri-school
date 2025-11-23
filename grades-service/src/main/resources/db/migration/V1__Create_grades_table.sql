-- Create grades table
CREATE TABLE IF NOT EXISTS grades_schema.grades (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 10),
    evaluation_type VARCHAR(100) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_grades_student_id ON grades_schema.grades(student_id);
CREATE INDEX idx_grades_professor_id ON grades_schema.grades(professor_id);
CREATE INDEX idx_grades_subject ON grades_schema.grades(subject);
