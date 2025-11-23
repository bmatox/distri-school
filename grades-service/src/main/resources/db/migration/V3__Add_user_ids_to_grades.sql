-- Add student_user_id and professor_user_id columns to grades table
ALTER TABLE grades_schema.grades ADD COLUMN student_user_id BIGINT;
ALTER TABLE grades_schema.grades ADD COLUMN professor_user_id BIGINT;

-- Create indexes for better query performance on user_id columns
CREATE INDEX idx_grades_student_user_id ON grades_schema.grades(student_user_id);
CREATE INDEX idx_grades_professor_user_id ON grades_schema.grades(professor_user_id);
