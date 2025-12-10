INSERT INTO users (username, password, role, enabled)
VALUES ('admin', '$2a$12$enLxLtJAcwlFF7txdA4bP.JNeVwPvuBx01V2AB8LK6W0taH.HkQF2', 'ROLE_ADMIN', true)
ON CONFLICT (username) DO NOTHING;
