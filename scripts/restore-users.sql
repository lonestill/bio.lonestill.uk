-- Восстановление пользователей
-- Дата: 2026-01-19T14:24:40.771Z

-- Удаляем старые восстановленные аккаунты
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'lonestill');
DELETE FROM users WHERE username = 'lonestill';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'test_role');
DELETE FROM users WHERE username = 'test_role';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'vantuzfed');
DELETE FROM users WHERE username = 'vantuzfed';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'vibecoded');
DELETE FROM users WHERE username = 'vibecoded';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'user7_unknown');
DELETE FROM users WHERE username = 'user7_unknown';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'xz_i_td');
DELETE FROM users WHERE username = 'xz_i_td';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = '0day');
DELETE FROM users WHERE username = '0day';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'dolboes');
DELETE FROM users WHERE username = 'dolboes';
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE username = 'kishmish');
DELETE FROM users WHERE username = 'kishmish';

-- Восстанавливаем пользователей с новыми паролями

-- lonestill (UID: 1)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('apeEYotdxfifVBg9LKegj', 1, 'lonestill', 'admin@lonestill.uk', '$argon2id$v=19$m=19456,t=2,p=1$VzxVTwuoJ0M/5qzu1fgb9w$VHdEH/cs1BMQe2Bouf4wDw7iYJ3OHmqTbO97/rmTEBs', 'admin', NULL, 1768832680);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('apeEYotdxfifVBg9LKegj', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- test_role (UID: 2)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('ZnuzDZC0kdeuKaf8EvqrV', 2, 'test_role', 'test@lonestill.uk', '$argon2id$v=19$m=19456,t=2,p=1$VLkjWsM+egju6uKaHQFC5g$DUIwbNSWJoy52/q9nKKbjJN3p7Quq3EtNkqPcbQds5k', 'user', NULL, 1768832680);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('ZnuzDZC0kdeuKaf8EvqrV', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- vantuzfed (UID: 3)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('qfUvEFoMvNwEgVHnoUd4r', 3, 'vantuzfed', 'vantuzfed@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$le++W4rxMwb4cz5kbHVv1Q$K5sMykvrwuQ5yK6kaofFFo5YKZ+2Ew16VPCwe1drTis', 'banned', NULL, 1768832680);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('qfUvEFoMvNwEgVHnoUd4r', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- vibecoded (UID: 6)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('HMwdIIBfZx2cl8zEKYP5C', 6, 'vibecoded', 'vibecoded@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$MgHDTQTN0ALr93pF5FiHMQ$zl8/6LF2vTKNdCd9ZbfZtzFi/zsmDDrASlmeVCCbSDs', 'user', NULL, 1768832680);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('HMwdIIBfZx2cl8zEKYP5C', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- user7_unknown (UID: 7)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('JMO155Y8yAapT2e_llY6Y', 7, 'user7_unknown', 'user7@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$Qm+VBVj2MI8XljXu/gPvpA$e3/qyemmDEsRnytPDRwJEn0cAMLcgVT4e2a6ObZd4AM', 'user', NULL, 1768832680);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('JMO155Y8yAapT2e_llY6Y', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- xz_i_td (UID: 9)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('5H1BK8HGsBivLnHnStu4S', 9, 'xz_i_td', 'xz_i_td@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$D+08r7QWsva9dmRWBARziA$bTf2FBRDViveagiPvUmx95lZ003yJjsMqQGb4/9Lk9o', 'premium', '["premium"]', 1768832681);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('5H1BK8HGsBivLnHnStu4S', NULL, 0, NULL, NULL, NULL, NULL, NULL, '{"enabled":true,"style":"gradient","position":"after-name","customText":"PREMIUM","color":"#fbbf24","glowColor":"#fbbf24"}');

-- 0day (UID: 10)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('l6x6tXASpvS5_GkaW4k9f', 10, '0day', '0day@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$Pd1PJLRvkJU4x6wEylTGkA$YjKc3d33EUawkzSqPzc+UWWx6rWt5LfU8EYVdYTlc0o', 'user', NULL, 1768832681);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('l6x6tXASpvS5_GkaW4k9f', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- dolboes (UID: 11)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('-wKIi65ghNwSD_wizCKEy', 11, 'dolboes', 'dolboes@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$WDA0LFddKpPN+54gy5EVtA$8PQcqmQPslCAqcsPx9wa3bT/5t7dSpDsU6YT4Yi19hE', 'user', NULL, 1768832681);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('-wKIi65ghNwSD_wizCKEy', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- kishmish (UID: 15)
INSERT INTO users (id, uid, username, email, password_hash, role, badges, created_at) VALUES
('asgdldJ3wYk5hK3LjL5Y-', 15, 'kishmish', 'kishmish@temp.com', '$argon2id$v=19$m=19456,t=2,p=1$IViNpv2sas++JouDU5d4WA$HT1CQRoCkVdp4BmWRD7mYhDiwSZ3kPF5ffeF39NfEGM', 'user', NULL, 1768832681);

INSERT INTO profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules, premium_badge_config) VALUES
('asgdldJ3wYk5hK3LjL5Y-', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

