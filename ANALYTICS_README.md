# Расширенная система аналитики

## ✅ Что было сделано

### 1. Новые таблицы в базе данных
- **page_views** - детальные просмотры страниц с информацией о браузере, ОС, устройстве, geo-данными
- **user_events** - события пользователей (клики, скроллы, hover и т.д.)
- **user_sessions** - сессии пользователей с агрегированной статистикой
- **analytics_events** - кастомные аналитические события

### 2. API endpoints

#### POST /api/analytics/track
Универсальный endpoint для отслеживания всех типов событий:

**Типы событий:**
- `pageview` - просмотр страницы
- `event` - пользовательское событие (клик, скролл)
- `session` - обновление сессии
- `custom` - кастомное аналитическое событие

**Пример:**
```javascript
fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'pageview',
    sessionId: 'session-123',
    username: 'john',
    path: '/john',
    referrer: 'https://google.com',
    screenWidth: 1920,
    screenHeight: 1080
  })
});
```

#### GET /api/analytics/advanced
Получение расширенной аналитики с фильтрами:

**Параметры:**
- `timeRange` - период (24h, 7d, 30d, 90d, all)
- `groupBy` - группировка (hour, day, week, month)
- `eventType` - фильтр по типу события
- `device` - фильтр по устройству
- `browser` - фильтр по браузеру

**Пример:**
```javascript
const response = await fetch('/api/analytics/advanced?timeRange=7d&groupBy=day');
const data = await response.json();
```

### 3. Клиентские компоненты

#### AnalyticsTracker
Автоматический трекинг всех действий пользователя:
- ✅ Просмотры страниц
- ✅ Время на странице
- ✅ Клики по элементам
- ✅ Глубина скролла
- ✅ Видимость вкладки

Уже подключен в `app/layout.tsx`:
```tsx
<AnalyticsTracker enabled={true} />
```

#### useAnalytics Hook
Для ручного трекинга событий:

```tsx
import { useAnalytics } from '@/components/analytics-tracker';

function MyComponent() {
  const { trackEvent, trackCustom } = useAnalytics();
  
  // Отследить событие
  trackEvent('button_click', { buttonId: 'signup' });
  
  // Отследить кастомное событие
  trackCustom('conversion', 'signup', 'premium', 1);
}
```

### 4. UI компоненты

#### AdvancedAnalyticsPanel
Панель расширенной аналитики в дашборде:
- 📊 Графики динамики посещений
- 📱 Статистика по устройствам
- 🌐 Браузеры и ОС
- 🌍 География (если настроена)
- 🔗 Популярные страницы
- 👆 Топ событий
- 📈 Статистика сессий

Доступна в дашборде через вкладку "Расширенная аналитика".

## 📊 Что отслеживается

### Автоматически:
- Просмотры всех страниц
- Время нахождения на странице
- Клики по ссылкам и кнопкам
- Глубина прокрутки страницы
- Смена видимости вкладки
- Информация о браузере и устройстве
- Разрешение экрана

### Собираемые данные:
- **Устройство**: desktop, mobile, tablet
- **Браузер**: Chrome, Firefox, Safari, Edge, Opera и др.
- **ОС**: Windows, macOS, Linux, iOS, Android
- **Геолокация**: страна, город (опционально)
- **Источник**: referrer
- **Сессии**: продолжительность, количество страниц, событий

## 🔒 Приватность

Все данные анонимизированы:
- IP адреса хешируются (SHA-256)
- Хранятся только агрегированные метрики
- Нет персональных данных

## 🚀 Использование

### Просмотр аналитики:
1. Зайдите в дашборд
2. Откройте вкладку "Расширенная аналитика"
3. Выберите период и группировку
4. Изучайте детальную статистику

### Добавление кастомных событий:
```tsx
import { useAnalytics } from '@/components/analytics-tracker';

function PremiumButton() {
  const { trackCustom } = useAnalytics();
  
  const handleUpgrade = () => {
    trackCustom(
      'engagement',      // категория
      'premium_click',   // действие
      'upgrade_button',  // метка (опционально)
      99,                // значение (опционально)
      { source: 'hero' } // метаданные (опционально)
    );
  };
}
```

## 📁 Структура файлов

```
db/schema.ts                          # Схемы новых таблиц
lib/analytics.ts                      # Утилиты (parseUserAgent, hashIP, и т.д.)
app/api/analytics/track/route.ts      # API для трекинга
app/api/analytics/advanced/route.ts   # API для получения данных
components/analytics-tracker.tsx      # Клиентский трекер
components/dashboard/advanced-analytics-panel.tsx  # UI панель
```

## ⚙️ Настройка геолокации (опционально)

В файле `lib/analytics.ts` есть функция `getGeoFromIP`. Для включения:

1. Зарегистрируйтесь на ipapi.co или ip-api.com
2. Раскомментируйте код в функции
3. Добавьте API ключ в .env (если требуется)

## 🔧 Миграция

Выполнена безопасная миграция:
- ✅ Создан бекап данных
- ✅ Данные из `premium_badge_config` перенесены в `modules.badgeConfigs`
- ✅ Применены изменения схемы

Файлы бекапа:
- `backup-premium-badge-config-*.json`
- `restore-premium-badge-config-*.sql`
