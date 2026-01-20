# UID Display с Hint для lonestill 🎮

## Описание

Специальный интерактивный элемент отображения UID для пользователя **lonestill** с оригинальным форматом и информативным hint при наведении.

### Особенности:

1. **Специальный формат UID:**
   - Обычные пользователи: `#123`
   - **lonestill**: `0x1` (hexadecimal формат, как в программировании)

2. **Визуальное оформление:**
   - По дефолту: слегка подсвеченный элемент
   - При наведении: яркое свечение и увеличенная подсветка
   - Только для lonestill полный интерактивный элемент

3. **Интерактивный Hint/Tooltip:**
   - Показывается при наведении курсора на UID lonestill
   - **Ping (задержка)**: измеряется в реальном времени при показе хинта
   - **Возраст проекта**: время с момента релиза (18 января 2026, 19:30 МСК)

## Как использовать

### Для отображения:

1. Включите отображение UID в дашборде:
   - Откройте **Dashboard**
   - Перейдите в **Профиль**
   - Найдите переключатель **"ID пользователя"**
   - Включите его

2. Навесите курсор на UID (если вы lonestill) - появится красивый tooltip

### Для lonestill:

Не требует настройки! Просто:
1. Включите показ UID в профиле
2. На вашей странице UID будет показываться как `0x1`
3. При наведении покажется hint с:
   - 🌐 **Ping** - текущая задержка до сервера (в миллисекундах)
   - ⏳ **Возраст** - сколько времени прошло с релиза проекта

## Технические детали

### Файлы:

- `components/uid-display.tsx` - компонент с логикой
- `components/bio-renderer.tsx` - интеграция в профиль
- `app/api/health/route.ts` - endpoint для проверки пинга

### Как работает Ping:

```typescript
const start = performance.now();
await fetch("/api/health", { method: "HEAD", cache: "no-store" });
const end = performance.now();
const ping = Math.round(end - start);
```

Используется HEAD запрос для минимального оверхеда.

### Как вычисляется возраст:

```typescript
const releaseDate = new Date("2026-01-18T19:30:00+03:00"); // МСК
const now = new Date();
const diff = now.getTime() - releaseDate.getTime();
// Форматируется как: "1d 5h 30m"
```

### Формат UID:

```typescript
const isLonestill = username.toLowerCase() === "lonestill";
const displayUid = isLonestill ? `0x${uid.toString(16)}` : `#${uid}`;
```

- `0x1` для lonestill (1 в hexadecimal)
- `#1` для остальных

## Стили

**Обычный UID:**
- Цвет: `textColor70`
- Размер: 12px (font-mono)

**Lonestill UID (интерактивный):**
- Обычное состояние:
  - Background: `primaryColor10`
  - Border: `primaryColor30`
  - Padding: 2px 8px
  - Border-radius: 6px

- При наведении:
  - Background: `primaryColor20`
  - Border: `primaryColor50`
  - Box-shadow: `0 0 15px primaryColor20`

**Tooltip:**
- Background: rgba(0, 0, 0, 0.9)
- Border: `primaryColor40`
- Text color: `primaryColor`
- Padding: 8px 12px
- Border-radius: 8px
- Position: абсолютная, над элементом

## Примеры

### Для обычного пользователя:
```
👤 Your Name
@username
# 42
```

### Для lonestill:
```
👤 lonestill
@lonestill
0x1  ← интерактивный, при наведении показывает tooltip
```

Tooltip при наведении:
```
🌐 Ping: 45ms
⏳ Возраст: 2d 3h 15m
```

## Адаптивность

- 📱 Мобильные: полностью функционален на touch-устройствах
- 🖥️ Десктоп: гладкие transitions и hover-эффекты
- ♿ Доступность: правильная семантика, можно взаимодействовать с клавиатуры (через Tab)
