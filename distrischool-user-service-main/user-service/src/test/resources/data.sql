MERGE INTO user_schema.users (id, name, email, password_hash, role, created_at, updated_at)
KEY (email)
VALUES (
  1,
  'System Administrator',
  'admin@distrischool.com',
  '$2a$12$enLxLtJAcwlFF7txdA4bP.JNeVwPvuBx01V2AB8LK6W0taH.HkQF2',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
