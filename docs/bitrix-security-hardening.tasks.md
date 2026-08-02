# apps/bitrix: security-hardening — транспорт auth (Bearer vs cookie), CSP, утечки токенов, открытые API-роуты

Статус: **не начато**
Приложение: `apps/bitrix` (аудит 2026-07-31)
Смежное: `packages/nest-api`, `packages/bitrix` (marketplace-сессия), бэкенд NestJS
Связанные документы: `back/docs/AUTH.md` (§0 «Bearer везде»),
`back/docs/tasks/centralized-auth.md`, `apps/bitrix/AUTH_UPGRADE.md` (легаси-флоу)

---

## 0. Транспорт auth: уходим от cookies (решение владельца, 2026-07-31)

**Решение:** cookies остаются **только для web-входа** (кабинет вне Битрикса).
Во фрейме Битрикса cookies **не используем вообще** — только Bearer-токен
в памяти вкладки.

Это совпадает с уже зафиксированным на бэке принципом
(`back/docs/AUTH.md` §0): third-party cookies в iframe ломаются уже сейчас
(Safari ITP) и будут ломаться дальше (CHIPS / Privacy Sandbox); гард
`@lib/auth` умеет читать оба транспорта, поэтому переезд может быть
постепенным. Там же прямо помечено, что `AUTH_UPGRADE.md` (httpOnly-cookie
флоу) — это **легаси клиентского бэка** и как общий транспорт проекта
НЕ принят.

### 0.1 Что это меняет в модели угроз (важно, не пропустить)

| | Cookie httpOnly (как сейчас в web) | Bearer in-memory (фрейм) |
|---|---|---|
| Кража токена при XSS | невозможна (JS не видит) | **возможна** — токен в памяти JS |
| CSRF | есть риск (`sameSite: none`), нужна проверка Origin на бэке | риска нет — браузер сам ничего не прикладывает |
| Работа в iframe Битрикса | ломается | работает |
| Переживает перезагрузку | да | нет (переоткрытие из Битрикса → новый код) |

Вывод: **при уходе на Bearer защита от XSS перестаёт быть «второй линией» и
становится первой** — CSP из этапа 1 обязателен, а токен нельзя класть
в `localStorage`/`sessionStorage` ни при каких условиях (только память).

### 0.2 Эталон, от которого отталкиваемся (уже написан и работает)

`packages/bitrix/src/marketplace` — portal-context сессия кабинета:

- `session.bootstrap.ts` — одноразовый `code` из query → `POST
  /api/bitrix-marketplace/session/exchange` → сессия; `code` сразу вычищается
  из URL (`stripCodeFromUrl`), повторный обмен невозможен.
- `session.store.ts` — токен **только в памяти**, на `globalThis`-синглтоне;
  в комментарии прямо: «Токен НИКОГДА не попадает в
  localStorage/sessionStorage/cookies». Есть `waitForToken` (закрывает гонку
  «запрос ушёл раньше, чем приехал токен») и `markExpired` на 401.
- `pbx-api.client.ts:123` — подстановка `Authorization: Bearer <token>`.

Второй готовый паттерн для orval-пакетов — `configureAuthTokenGetter`
(`packages/nest-konstructor-api/src/lib/auth/auth-token.ts`, такие же файлы
в `nest-admin-api`, `nest-pbx-install-api`): приложение отдаёт пакету геттер
токена, пакет вешает request-интерцептор с Bearer. В `packages/nest-api`
(который использует `apps/bitrix`) такого файла **нет** — там только
cookie-флоу (`back-api.ts:25` — `withCredentials: true`) и
response-интерцептор с refresh (`lib/auth/auth-interceptor.ts`).

### 0.3 Что конкретно сделать по транспорту

- [ ] **Определить границу «фрейм / веб» в одном месте.** Сейчас признак
      фрейма размазан: `middleware.ts` различает пути (`/bitrix`, `/install`,
      `/placement/*` → пропускаем без проверки cookie), а внутри приложения
      есть свои флаги (`NEXT_PUBLIC_IN_BITRIX`, `IS_PROD`, `inFrame` из
      `packages/bitrix`). Нужен один хелпер/константа: какие роут-группы
      = фреймовые (Bearer), какие = web (cookie).
- [ ] **Добавить Bearer-транспорт в `packages/nest-api`** по образцу
      `nest-konstructor-api/src/lib/auth/auth-token.ts`:
      `configureAuthTokenGetter(getter)` + request-интерцептор на `$api`.
      Экспортировать из барреля пакета.
- [ ] **`withCredentials` сделать управляемым.** Сейчас в
      `packages/nest-api/src/lib/back-api.ts:25` он захардкожен `true` —
      во фреймовом режиме это лишняя отправка кук на кросс-домен (и повод
      для CORS-проблем). Сделать настройку через `configureBaseURL`
      (или отдельный `configureCredentials(mode)`), фрейм → `false`.
- [ ] **В `apps/bitrix` подключить сессию по фреймовому пути:**
      `modules/shared/api/api.ts` — для фреймовых страниц
      `configureAuthTokenGetter(() => portalSessionStore.getToken())`
      вместо cookie-флоу; на web-страницах оставить текущий
      `installAuthInterceptor` c refresh.
- [ ] **Не хранить Bearer нигде, кроме памяти.** Явно зафиксировать правило
      в коде (комментарий + code review): ни `localStorage`, ни
      `sessionStorage`, ни cookie. Ср. `apps/admin`, где access-токен лежит
      в cookie фронтового домена (`AUTH.md` §2.8) — для фрейма так нельзя.
- [ ] **Продумать поведение при потере токена во фрейме**: перезагрузка
      iframe → токена нет → показать экран «переоткройте приложение
      в Битрикс24», а не белый экран и не молчаливые 401 (в
      `session.store.ts` для этого уже есть статусы `absent` / `expired`).
- [ ] **Определить судьбу legacy cookie-флоу** (`AUTH_UPGRADE.md`,
      `apps/back bitrix-app-client/auth`): он остаётся для web-кабинета до
      появления `apps/auth` (см. `AUTH.md` §4 п.4). Зафиксировать в этом
      документе итог обсуждения, чтобы не поддерживать два транспорта
      на одних и тех же страницах.

**Как проверить:**

1. Открыть приложение во фрейме Битрикс24 в Chrome с **выключенными
   third-party cookies** (`chrome://settings/cookies` → «Блокировать
   сторонние файлы cookie») и в Safari. Приложение должно полностью
   работать: DevTools → Network → на запросах к бэку есть заголовок
   `Authorization: Bearer ...` и **нет** `Cookie`.
2. DevTools → Application → Local/Session Storage и Cookies домена
   приложения: ключей с JWT нет. Быстрая проверка в консоли:
   `Object.entries(localStorage).filter(([,v]) => /eyJ[\w-]+\./.test(v))`
   → пустой массив.
3. Web-вход (вне фрейма) продолжает работать на cookies: в Network у
   запросов есть `Cookie: access_token=...`, редирект неавторизованного
   на `/auth/login` отрабатывает.
4. Перезагрузить iframe (F5 внутри фрейма) → ожидаемый экран «откройте
   приложение заново», без бесконечных 401 в консоли.

---

## 1. Контекст аудита (что проверялось)

Вопрос: есть ли в `apps/bitrix` защита от XSS и смежных уязвимостей.
Итог: от классического XSS приложение защищено «бесплатно» (весь вывод через
JSX, React экранирует), но целенаправленной защиты нет, и есть ряд реальных
проблем другого рода.

### Что уже хорошо (не ломать при доработках)

- `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`,
  `insertAdjacentHTML` — не используются нигде в приложении.
- Единственный `innerHTML` — рендер mermaid в
  `app/(product)/how-we-work/hooks/use-mermaid-render.ts:37`; mermaid
  инициализирован с `securityLevel: 'strict'` (строка 30), текст диаграмм
  статический, не пользовательский.
- `window.open` для порталов открывается только после regex-валидации
  домена на `*.bitrix24.(ru|com|ua|kz|by)` — `javascript:`-URL не подсунуть.
- Редирект после install идёт на фиксированный `NEXT_PUBLIC_APP_URL`
  (`app/api/bitrix/install/lib/redirect.util.ts:14`), а не на host из
  заголовков запроса → open redirect закрыт.
- Запросы к бэку — только через orval-клиенты (`modules/shared/api/api.ts`),
  ручных URL нет.

**Как перепроверить (регресс-грепы, должны оставаться пустыми):**

```bash
rg -n "dangerouslySetInnerHTML|innerHTML|insertAdjacentHTML|document\.write|eval\(|new Function" apps/bitrix
rg -n "href=\{[^}]*(props|data|user|item)" apps/bitrix   # href из непроверенных данных
rg -n "securityLevel" apps/bitrix                        # у mermaid должен быть 'strict'
```

## 2. Найденные проблемы

1. **Нет ни одного security-заголовка.** `next.config.ts` не задаёт
   `headers()`, `middleware.ts` заголовки не ставит. Нет CSP (в т.ч.
   `frame-ancestors`), `X-Content-Type-Options`, `Referrer-Policy`.
   Любой сайт может встроить приложение в iframe (кликджекинг); нет второй
   линии обороны от XSS — а после перехода на Bearer (§0) она становится
   первой.
2. **Токены в логах.**
   - `middleware.ts:50` — `console.log('token', token)`: JWT access token
     в серверных логах на каждый matched-запрос.
   - `app/api/bitrix/lib/get-token-payload-by-params.util.ts:72-74` —
     логирует весь `tokenPayload`, включая access/refresh токены портала
     Битрикс24 (`AUTH_ID` / `REFRESH_ID`).
3. **`/api/bitrix/install` не проверяет подлинность запроса**
   (`app/api/bitrix/install/route.ts:12-36`): принимает неаутентифицированный
   POST, парсит `auth` из тела и передаёт токены в `setupBitrixApp` без
   сверки `application_token` — любой может отправить фейковую установку.
   На бэке этот паттерн уже решён правильно (`AUTH.md` §2.5: `/event`
   сверяет `auth[application_token]` с сохранённым шифротекстом).
4. **`client_secret` в localStorage.** Страница OAuth-настроек сохраняет
   `client_secret` в `localStorage` (ключ `bitrix_oauth_config`),
   продублирована 4 раза:
   - `app/(product)/bitrix/secret/page.tsx:123`
   - `app/(protected)/standalone/app/secret/page.tsx:123`
   - `modules/widgetes/bx-app/ui/BitrixAppOauthWidget.tsx:123`
   - плюс копии кабинета, кладущие `currentUser` в localStorage
     (`app/(product)/bitrix/page.tsx:105`, `PortalApps.tsx:115`,
     `app/(protected)/standalone/app/layout.tsx:105`)

   Сейчас сохранение — заглушка (реальный API не вызывается, там
   `setTimeout` и `Math.random()`), но паттерн опасный сам по себе, а после
   §0 localStorage вообще становится запретной зоной.
5. **CSRF на web-флоу.** Cookies в prod — `sameSite: none` +
   `withCredentials: true` (`packages/nest-api/src/lib/back-api.ts:25`),
   CSRF-токенов на фронте нет. Вся защита держится на бэкенде (CORS
   allowlist + проверка Origin) — нужно убедиться, что она там есть.
   Во фреймовом Bearer-флоу (§0) проблема снимается сама.
6. **`/api/send` — открытый прокси в Telegram** (`app/api/send/route.ts`):
   без auth, rate-limit и валидации пересылает произвольный JSON в Telegram
   (`api.telegramGetTelegram({ text: JSON.stringify(payload) })`) —
   готовый канал для спама/флуда.
7. **`/api/metrics` публичный** (`app/api/metrics/route.ts`): prom-client
   отдаёт метрики процесса (память, CPU, версия Node) любому желающему.
8. **CSS с CDN без SRI** — `app/head.tsx:8-11` грузит стили pace-js
   с `cdn.jsdelivr.net` без атрибута `integrity`.

## 3. План работ

### Этап 1 — security-заголовки / CSP (обязательный)

- [ ] В `next.config.ts` добавить `headers()`:
      - `Content-Security-Policy` с `frame-ancestors 'self'
        https://*.bitrix24.ru https://*.bitrix24.com https://*.bitrix24.ua
        https://*.bitrix24.kz https://*.bitrix24.by` (список зон сверить
        с regex в secret-страницах: там `ru|com|ua|kz|by`);
      - `script-src` / `style-src` / `connect-src` — учесть `mc.yandex.ru`
        (метрика, `components/metrika.tsx:41`), `cdn.jsdelivr.net`
        (или убрать, см. этап 5), бэкенд `NEXT_PUBLIC_API_URL`,
        WS-эндпоинты (`QueueWsPingListener`);
      - `X-Content-Type-Options: nosniff`,
        `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] Раскатывать CSP через `Content-Security-Policy-Report-Only` **первым
      шагом** (Next.js + inline-стили Tailwind/next-themes почти наверняка
      потребуют донастройки), затем переключить на боевой заголовок.
- [ ] Проверить, что `X-Frame-Options` нигде не выставлен (он не понимает
      список доменов и сломает фрейм Битрикса — нужен только
      `frame-ancestors`).

**Как проверить:**

```bash
# заголовки в ответе (локально или на стенде)
curl -sI https://<host>/home | rg -i "content-security-policy|x-content-type|referrer-policy|x-frame-options"
```

PowerShell-вариант: `(Invoke-WebRequest https://<host>/home).Headers`.

1. Открыть приложение во фрейме Битрикс24 — рендерится, в консоли нет
   `Refused to frame` / `Refused to load`.
2. Проверить кликджекинг: создать локальный html
   `<iframe src="https://<host>/standalone"></iframe>`, открыть с чужого
   origin → фрейм должен быть заблокирован с ошибкой `frame-ancestors`.
3. Пройти по основным страницам с открытой консолью в Report-Only режиме:
   собрать список нарушений, добить директивы, только потом включать боевой
   заголовок.
4. Метрика Яндекса продолжает грузиться (Network → `mc.yandex.ru/metrika/tag.js`
   статус 200, не заблокирован CSP).

### Этап 2 — зачистка токенов из логов (обязательный, быстро)

- [ ] `middleware.ts:50-51` — удалить `console.log('token', token)`.
      Если лог пути нужен — оставить только `pathname`.
- [ ] `app/api/bitrix/lib/get-token-payload-by-params.util.ts:72-74` —
      убрать лог `tokenPayload`; при необходимости логировать только
      `event`, `placement`, `domain`, `member_id` и булев
      `hasToken: !!access_token`.
- [ ] Пройти остальные роуты `app/api/bitrix/*` и `redirect.util.ts:15` —
      убрать debug-логи или замаскировать значения.

**Как проверить:**

```bash
rg -n "console\.(log|debug|info)" apps/bitrix/middleware.ts apps/bitrix/app/api
# токеноподобные строки в логах контейнера
docker logs <bitrix-front-container> 2>&1 | rg -n "eyJ[A-Za-z0-9_-]{10,}|AUTH_ID|REFRESH_ID|refresh_token"
```

Ожидание: второй греп ничего не находит после прохода полного цикла
(открытие во фрейме + установка приложения + web-логин).

### Этап 3 — защита API-роутов (обязательный)

- [ ] `/api/bitrix/install`: сверять `application_token` из события
      с сохранённым (или с env) **до** вызова `setupBitrixApp`; невалидный
      запрос → 403, а не редирект `install=success`. Ориентир — реализация
      `/event` на бэке (`AUTH.md` §2.5).
- [ ] `/api/send`: добавить rate-limit (по IP + окно), проверку
      `Origin`/`Referer` своего домена, валидацию shape payload и лимит
      размера тела. Лучше — перенести отправку на бэкенд за auth,
      а роут удалить.
- [ ] `/api/metrics`: закрыть (токен из env в заголовке, allowlist IP на
      реверс-прокси или вынос на внутренний порт).
- [ ] Свериться с бэкендом по CSRF (п. 2.5): CORS allowlist строгий,
      Origin проверяется на мутациях. Актуально ровно до тех пор, пока
      жив cookie-флоу для web.

**Как проверить:**

```bash
# 1. install без application_token — ждём 403, не "success"
curl -si -X POST "https://<host>/api/bitrix/install?DOMAIN=evil.bitrix24.ru" \
  -d "event=ONAPPINSTALL&auth={\"access_token\":\"fake\",\"refresh_token\":\"fake\"}"

# 2. /api/send с чужого Origin — ждём 403
curl -si -X POST https://<host>/api/send -H "Origin: https://evil.example" \
  -H "Content-Type: application/json" -d '{"text":"pwn"}'

# 3. rate-limit: 20 быстрых запросов — часть должна отдать 429
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<host>/api/send \
  -H "Content-Type: application/json" -d '{"text":"flood"}'; done

# 4. метрики снаружи — ждём 401/403/404
curl -si https://<host>/api/metrics | head -1
```

Плюс: после фейкового install проверить в БД, что новой записи портала
не появилось, и что в Telegram не пришло сообщений от флуд-теста.

### Этап 4 — localStorage-секреты и дубли (средний приоритет)

- [ ] Убрать сохранение `client_secret` в `localStorage` из всех трёх
      копий; конфиг хранить на бэкенде за auth.
- [ ] Схлопнуть 4 копии страницы/виджета в один компонент
      (`modules/widgetes/bx-app`), страницы сделать тонкими обёртками
      (по правилам `front-refactor`).
- [ ] `currentUser` из localStorage заменить на данные сессии
      (`/auth/me` для web, portal-session для фрейма).
- [ ] Явное правило в коде: секреты и токены — не в Storage (см. §0).

**Как проверить:**

```bash
rg -n "localStorage|sessionStorage" apps/bitrix --glob '!*.md'
```
Ожидание: остаются только безрисковые ключи UI-состояния
(`lead_form_source`, состояние сайдбара `use-leads-sidebar.ts`,
черновики анкеты/flow-вариантов) — никаких `client_secret`, `currentUser`,
токенов. В браузере: Application → Local Storage → ключа
`bitrix_oauth_config` нет.

### Этап 5 — гигиена (низкий приоритет)

- [ ] `app/head.tsx`: pace-CSS — положить в `public/` (self-host), тогда
      и CSP проще; альтернатива — добавить `integrity` + `crossorigin`.
- [ ] Убрать/закрыть за dev-флагом тестовые страницы с mock-значениями
      `'access_token_here'` (`app/(integrations)/portal/[portalId]/page.tsx`,
      `app/(protected)/standalone/portal/[portalId]/app/[appId]/*` и копии).
- [ ] `LeadForm.tsx:131` — захардкоженный `ym(12345678, ...)` с комментарием
      «Заменить на реальный ID счетчика»: либо реальный ID из env, либо убрать.
- [ ] Общий проход по `console.log` в прод-коде приложения.

**Как проверить:**

```bash
rg -n "cdn\.jsdelivr|access_token_here|12345678" apps/bitrix
```

## 4. Критерии приёмки

- **Транспорт:** во фрейме приложение работает при полностью выключенных
  third-party cookies; в запросах из фрейма есть `Authorization: Bearer`
  и нет `Cookie`. Токен не найден ни в localStorage, ни в sessionStorage,
  ни в cookies. Web-вход продолжает работать на httpOnly-cookies.
- **Заголовки:** в проде отдаются CSP (с `frame-ancestors` только под
  bitrix24-зоны и self), `X-Content-Type-Options`, `Referrer-Policy`;
  фрейм Битрикса при этом не сломан, чужой iframe заблокирован.
- **Логи:** после полного цикла (открытие во фрейме, установка, web-логин)
  в серверных логах нет ни одного JWT и ни одного битриксового
  `AUTH_ID`/`REFRESH_ID`.
- **API-роуты:** POST на `/api/bitrix/install` без валидного
  `application_token` → 403 и отсутствие записи в БД; `/api/send` не
  принимает запросы с чужого Origin и ограничен по частоте;
  `/api/metrics` снаружи недоступен.
- **Storage:** `rg "localStorage|sessionStorage" apps/bitrix` не находит
  ни секретов, ни токенов, ни `currentUser`.
