-- Insert default ADMIN user for initial system access
-- Credentials: admin@distrischool.com / admin123
-- Password hash generated with BCrypt for 'admin123'

INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@distrischool.com',
    '$2b$12$kOKLxSvI4YxowaksUvZqFuhNXWOrlYE40A5QUVEnBOPMj8DKfQLA6',
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
