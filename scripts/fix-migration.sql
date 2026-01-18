-- Удалить старые данные из users, если они не нужны
-- Если данные нужны, замените DELETE на UPDATE:
-- UPDATE users SET email = username || '@example.com' WHERE email IS NULL;

DELETE FROM users;
