INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@distrischool.com',
    '$2a$12$enLxLtJAcwlFF7txdA4bP.JNeVwPvuBx01V2AB8LK6W0taH.HkQF2',
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
