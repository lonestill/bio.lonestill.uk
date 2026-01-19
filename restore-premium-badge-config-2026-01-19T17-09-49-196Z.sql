-- Restore for user_id: apeEYotdxfifVBg9LKegj
UPDATE profiles SET modules = json_set(
  COALESCE(modules, '{}'),
  '$.badgeConfigs.premium',
  json('{"enabled":true,"style":"gradient","position":"after-name","color":"#fbbf24","glowColor":"#fbbf24"}')
) WHERE user_id = 'apeEYotdxfifVBg9LKegj';

-- Restore for user_id: 5H1BK8HGsBivLnHnStu4S
UPDATE profiles SET modules = json_set(
  COALESCE(modules, '{}'),
  '$.badgeConfigs.premium',
  json('{"enabled":true,"style":"gradient","position":"after-name","customText":"PREMIUM","color":"#fbbf24","glowColor":"#fbbf24"}')
) WHERE user_id = '5H1BK8HGsBivLnHnStu4S';
