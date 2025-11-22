-- Add fields to link users with domain entities
ALTER TABLE users ADD COLUMN external_id BIGINT;
ALTER TABLE users ADD COLUMN user_type VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX idx_users_external_id ON users(external_id);
CREATE INDEX idx_users_user_type ON users(user_type);
