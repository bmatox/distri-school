-- Test data initialization for H2 in-memory database
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO users (username, password, role, enabled)
VALUES ('admin', '$2a$12$enLxLtJAcwlFF7txdA4bP.JNeVwPvuBx01V2AB8LK6W0taH.HkQF2', 'ROLE_ADMIN', true)
ON CONFLICT DO NOTHING;
