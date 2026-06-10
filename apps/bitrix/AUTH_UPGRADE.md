# Auth Upgrade: Access + Refresh Tokens (httpOnly cookies)

## Что изменилось на бэкенде

### Новый флоу аутентификации

Вся работа с токенами теперь на стороне бэкенда через **httpOnly cookies**.
Фронт **не видит и не хранит токены** — браузер сам прикладывает cookie к запросам.

### Эндпоинты

| Метод | URL | Guard | Описание |
|-------|-----|-------|----------|
| POST | `/auth/login` | — | Логин. Устанавливает 2 httpOnly cookie |
| POST | `/auth/refresh` | RefreshGuard | Обновляет оба токена (ротация) |
| POST | `/auth/logout` | AuthGuard | Удаляет cookie + revoke refresh в БД |
| GET | `/auth/me` | AuthGuard | Текущий пользователь и клиент |
| POST | `/auth/register-client` | — | Регистрация (без изменений) |
| GET | `/auth/confirm/:token` | — | Подтверждение email (без изменений) |
| POST | `/auth/resend-confirmation` | — | Повторная отправка email |

### Cookies

| Cookie | TTL | Path | Назначение |
|--------|-----|------|------------|
| `access_token` | 15 минут | `/` | JWT access token |
| `refresh_token` | 7 дней | `/` | JWT refresh token |

Обе cookie: `httpOnly`, `secure`, `sameSite: none` (prod) / `lax` (dev).

---

## Что сделано на фронте (выполнено)

### 1. Пакет `@workspace/nest-api` — auth модуль

Создан модуль `src/lib/auth/` с переиспользуемой логикой для всех приложений монорепы:

| Файл | Назначение |
|------|------------|
| `auth-interceptor.ts` | Axios response interceptor: 401 → refresh → retry (с очередью) |
| `auth-refresh-helper.ts` | Singleton-промис для refresh (request coalescing) |
| `auth-error.ts` | `ApiClientError`, `formatApiErrorMessage`, `getApiErrorMessage` |
| `auth.types.ts` | `AuthInterceptorOptions` — callbacks `onAuthFailed`, `onApiError` |
| `index.ts` | Barrel-экспорт |

Рефакторинг `back-api.ts`:
- `configureBaseURL(url)` — позволяет задавать baseURL из `process.env.NEXT_PUBLIC_API_URL`
- `$api` — экспортируемый axios-инстанс с `withCredentials: true`
- Удалены закомментированные legacy-interceptors

### 2. Bitrix app — `modules/shared/api/`

| Файл | Что сделано |
|------|-------------|
| `api.ts` | Центральная точка конфигурации: `configureBaseURL` + `setupAuthInterceptor` + экспорт API-инстансов |
| `client.ts` | Добавлен `credentials: 'include'`, использует `API_BASE_URL` |
| `index.ts` | Barrel-экспорт всех api-модулей |

### 3. Bitrix app — auth flow

| Файл | Что сделано |
|------|-------------|
| `auth.helper.ts` | Использует `apiAuth` из shared/api вместо прямого `getAuth()` |
| `AuthThunk.ts` | Использует `getApiErrorMessage` для парсинга ошибок; logout → redirect |
| `AppThunk.ts` | Убран закомментированный refresh, упрощён — interceptor сам делает retry |

### 4. Toast-уведомления

- Установлен `sonner`
- `ApiInitializer` — компонент, инициализирующий auth interceptor с toast-уведомлениями
- `Toaster` + `ApiInitializer` добавлены в `Providers`
- Ошибки 4xx → `toast.warning`, 5xx → `toast.error`, сессия истекла → `toast.error` + redirect

### 5. Что удалено / очищено

- Закомментированный interceptor с `localStorage` в `back-api.ts`
- Закомментированный `fetch refresh` в `AppThunk.ts`
- `AUTH_TOKEN_NAME` помечен как `@deprecated`

---

## ENV переменные

### Бэкенд
```env
ACCESS_TOKEN_SECRET=your-access-secret-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
AUTH_COOKIE_SPA_DOMAIN=.april-app.ru
```

### Фронт
```env
NEXT_PUBLIC_API_URL=https://back.april-app.ru/
```

---

## Архитектура auth-слоя

```
@workspace/nest-api (пакет — переиспользуемый)
├── src/lib/back-api.ts          ← axios instance, customAxios (orval mutator)
├── src/lib/auth/
│   ├── auth-interceptor.ts      ← installAuthInterceptor(opts)
│   ├── auth-refresh-helper.ts   ← refreshTokens() — singleton promise
│   ├── auth-error.ts            ← error parsing utilities
│   ├── auth.types.ts            ← AuthInterceptorOptions
│   └── index.ts
├── src/generated/auth/auth.ts   ← orval-generated API (getAuth)
└── index.ts                     ← barrel exports

apps/bitrix (приложение)
├── modules/shared/api/
│   ├── api.ts                   ← configureBaseURL + setupAuthInterceptor + api инстансы
│   ├── client.ts                ← fetch-based client (credentials: include)
│   └── index.ts
├── modules/processes/auth/
│   ├── lib/auth.helper.ts       ← AuthHelper class (login, register, logout, me)
│   ├── model/thunk/AuthThunk.ts ← redux thunks
│   └── model/slice/AuthSlice.ts ← redux state
├── components/
│   ├── api-initializer.tsx      ← setupAuthInterceptor + toast callbacks
│   └── providers.tsx            ← Toaster + ApiInitializer
└── middleware.ts                ← Next.js middleware (cookie check, redirects)
```

### Как подключить auth в другом приложении монорепы

```ts
// В любом приложении:
import { configureBaseURL, installAuthInterceptor } from '@workspace/nest-api';

configureBaseURL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/');

installAuthInterceptor({
  onAuthFailed: () => { window.location.href = '/login'; },
  onApiError: (msg, status) => { console.error(msg); },
});
```

Если auth не нужен — просто не вызывайте `installAuthInterceptor()`.

---

## Что нужно сделать дальше

### Высокий приоритет

- [ ] **Backend: Forgot password** — `POST /auth/forgot-password { email }` → генерация токена, отправка email со ссылкой
- [ ] **Backend: Reset password** — `POST /auth/reset-password { token, password }` → сброс пароля, revoke всех refresh-токенов
- [ ] **Frontend: Forgot password page** — `/auth/forgot-password` → форма email → "Проверьте почту"
- [ ] **Frontend: Reset password page** — `/auth/reset-password?token=xxx` → форма нового пароля

### Средний приоритет

- [ ] **Backend: Change password** — `POST /auth/change-password { currentPassword, newPassword }` (AuthGuard)
- [ ] **Frontend: Change password UI** — в настройках профиля `/standalone/settings`
- [ ] **Backend: Swagger fix** — `@Body('email')` на `resend-confirmation` не генерирует параметр в OpenAPI
- [ ] **Backend: `confirmUserEmail`** — добавить endpoint в контроллер (метод есть в сервисе, но не подключён)

### Роли и мультитенантность (следующий этап)

- [ ] **Enum roles для клиента** — обновить модель
- [ ] **Приглашение пользователей** — root user может добавлять пользователей в свой client
- [ ] **Подтверждение email для приглашённых** — отдельный flow
- [ ] **Запрет самостоятельной регистрации** на занятый домен

---

## Таблица для refresh токенов

Используется существующая таблица `personal_access_tokens`:

| Поле | Значение |
|------|----------|
| `tokenable_type` | `'User'` |
| `tokenable_id` | `user.id` |
| `name` | `'refresh_token'` |
| `token` | SHA-256 хеш refresh JWT |
| `expires_at` | `now + 7 дней` |
| `last_used_at` | Обновляется при каждом refresh |
