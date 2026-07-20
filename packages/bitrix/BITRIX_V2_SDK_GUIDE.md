# Bitrix v2 SDK Guide (`@workspace/bitrix`)

Документ для разработчиков **и для LLM-агентов**. Фиксирует: как устроен пакет,
как правильно пользоваться `@bitrix24/b24jssdk@2.x`, что уже переведено на v2,
что осталось, и как диагностировать сбои, не теряя день.

Родственный документ на бэке: `back/libs/bitrix/src/BITRIX_DOMAIN_MODULE_GUIDE.md`
(как добавлять новые Bitrix REST методы строго типизированно).

---

## 1. Что это за пакет

`@workspace/bitrix` — обёртка над `@bitrix24/b24jssdk@^2.0.0`, решающая две
независимые задачи:

| Ось | Что делает | Точка входа |
| --- | --- | --- |
| **Frame REST** | Работа с Битриксом из iframe-приложения: кто открыл, какие данные тянуть | `core/base/bitrix-base-api.ts` (`BitrixBaseApi`) |
| **Marketplace** | Portal-context сессия + API кабинета «Менеджер Гарант» | `src/marketplace/*` |

Эти оси **не связаны между собой**: marketplace ходит в собственный бэкенд
(`api.pbx.april-app.ru`) по Bearer-токену и вообще не использует b24jssdk.
Именно ради marketplace пакет когда-то подняли до v2 — это важно помнить, если
возникнет соблазн «просто откатить SDK».

### Кто на чём сидит (важно!)

| Пакет | SDK | Потребители |
| --- | --- | --- |
| `@workspace/bitrix` | **v2.0.0** | `kpi-service`, admin, konstructor, event-* |
| `@workspace/api` | **v0.1.7** | `kpi-sales` |

Обе версии физически лежат в `node_modules`. Это **не** конфликт: фрейм
инициализирует только та ветка, которую приложение реально вызывает. Но не
смешивайте их в одном приложении — два `initializeB24Frame()` в одном окне
означают два postMessage-хендшейка и два слушателя `message`.

---

## 2. `src/marketplace` — portal-context сессия

Фронтовая половина маркетплейса. Контракт бэка: `back/apps/pbx/src/marketplace`.

```
marketplace/
  session.types.ts       # контракт: PortalSession, состояния допуска, кабинет
  session.store.ts       # in-memory стор сессии (globalThis-синглтон)
  session.bootstrap.ts   # обмен одноразового ?code= на portal-context JWT
  pbx-api.client.ts      # ЕДИНЫЙ HTTP-клиент: Bearer, таймаут, ретраи, 401
  onboarding.api.ts      # заявка на допуск
  cabinet.api.ts         # сводка кабинета
  index.ts               # публичная поверхность
```

### Модель состояний допуска

`PortalSessionState`: `onboarding` → `pending` → `active` | `blocked` | `unauthorized`.
Состояние **вычисляет бэк**, фронт только рендерит. Не дублируйте эту логику на фронте.

### Три правила, которые нельзя нарушать

1. **Токен живёт только в памяти.** Никаких `localStorage`/`sessionStorage`/cookies.
   Потеря памяти (перезагрузка iframe) = переоткрытие приложения из Битрикса,
   бэк выдаст новый одноразовый код. У portal-context токена **нет refresh**.

2. **Стор — синглтон на `globalThis`** (`__pbxPortalSessionStore__`). Причина
   зафиксирована в коде: при `transpilePackages` + смешанных импортах (баррель
   `@workspace/bitrix` И глубокий `@workspace/bitrix/src/...`) webpack собирает
   **две копии модуля** — `exchange` кладёт токен в один инстанс, а `pbxRequest`
   читает другой, ловит 401 и показывает ложное «Сессия истекла».
   **Вывод для нового кода: импортируйте только из барреля `@workspace/bitrix`.**

3. **Весь HTTP — только через `pbxRequest`.** В нём централизованы таймаут (15с),
   ретраи (только идемпотентные GET, только сеть/5xx, 2 повтора с backoff) и
   обработка 401 → `markExpired()` + `SessionExpiredError`. `POST` не ретраится —
   побочные эффекты.

---

## 3. v2 SDK: критические правила

> Читать **до** того, как писать код против b24jssdk. Здесь собраны грабли,
> на которых уже потерян день.

### 3.1. Канонический init фрейма — минимальный

```ts
import { initializeB24Frame } from '@bitrix24/b24jssdk';

const b24 = await initializeB24Frame();
// всё. Больше на этом шаге НИЧЕГО не нужно.
```

`initializeB24Frame()` сам делает `init()` (postMessage-хендшейк `getInitData`
с родительским окном), дедуплицирует параллельные вызовы и разбирает
`window.name`. Отдельный `b24.init()` вызывать не нужно.

### 3.2. 🚨 НИКОГДА не задавайте кастомный `rateLimit`

**Это была причина полного отказа `kpi-service` (инцидент 2026-07-19).**

```ts
// ❌ НЕЛЬЗЯ. Кладёт ВСЕ REST-вызовы приложения.
await b24.setRestrictionManagerParams({
    rateLimit: { burstLimit: 50, drainRate: 2, adaptiveEnabled: true },
});
```

Что происходило: менеджер ограничений считал лимит исчерпанным и загонял
**каждый** вызов в backoff-ретраи, так и не дойдя до HTTP-запроса. Наружу это
выглядело как `JSSDK_CALL_ALL_ATTEMPTS_EXHAUSTED (500)` — и уводило
расследование в сторону «портал отдаёт 500 / CORS / нет прав / не та версия SDK».
Падали **все** методы, включая `server.time`.

Если действительно нужно тюнить restriction manager — **только** через
`ParamsFactory.getDefault()` как базу и только осознанно:

```ts
import { ParamsFactory } from '@bitrix24/b24jssdk';

await b24.setRestrictionManagerParams({
    ...ParamsFactory.getDefault(),   // ← база обязательна
    retryOnNetworkError: false,      // для НЕидемпотентных методов (*.add, upload)
});
```

### 3.3. Ошибки v2 маскируются — не верьте статусу

В `AbstractHttp.call()` финальная ошибка собирается так:

```js
status: lastError?.status || 500
```

`500` здесь — **дефолт-заглушка**, а не ответ портала. Расшифровка:

| Что видите | Что это на самом деле |
| --- | --- |
| `status: 500`, `originalError: null` | до HTTP не дошло (лимитер/пайплайн ретраев) |
| `status: 500`, `origCode: 'ERR_NETWORK'` | сеть/CORS — запрос не долетел |
| `status: 401/403/429`, есть `origCode` | реальный ответ портала (токен/права/лимит) |

**Всегда разворачивайте `error.originalError`**, прежде чем делать выводы.

### 3.4. Текущего пользователя знает ТОЛЬКО iframe

```ts
const res = await b24.actions.v2.call.make<IBXUser>({ method: 'user.current' });
```

`user.current` возвращает того, **чьим токеном** сделан вызов. Фрейм-токен →
реальный залогиненный человек. Вебхук/сохранённый админский токен на бэке →
владелец интеграции. **Поэтому идентификацию пользователя нельзя проксировать
через бэкенд** — это архитектурная граница, а не деталь реализации.

### 3.5. `callMethod` устарел — используйте `actions.v{2,3}.*`

```ts
// ❌ legacy-шим: печатает deprecation warning
await b24.callMethod('user.current', {}, -1);

// ✅ канон v2
await b24.actions.v2.call.make<T>({ method: 'user.current', params: {} });
```

Оговорка, экономящая время: **`callMethod` внутри вызывает тот же
`actions.v2.call.make`** — транспорт идентичен. Так что миграция сюда — вопрос
чистоты и типов, а **не** способ починить сетевой сбой.

### 3.6. Форма ответа

```ts
const res = await b24.actions.v2.call.make<T>({ method, params });
if (!res.isSuccess) {
    logger.warn(res.getErrorMessages().join('; '));
    return;
}
const data = res.getData()?.result;  // getData() типизирован как T | undefined
```

`getData()` может быть `undefined` — обязательна оптиональная цепочка, иначе
`tsc` уронит прод-сборку (`Object is possibly 'undefined'`).

---

## 4. Статус миграции на v2

### ✅ Переведено

| Место | Было | Стало |
| --- | --- | --- |
| `getCurrentUser()` — [bitrix-base-api.ts:137](src/core/base/bitrix-base-api.ts#L137) | `bx.callMethod('user.current')` | `bx.actions.v2.call.make` |
| `init()` | `setRestrictionManagerParams({ rateLimit })` | убрано (канон) |

### ⏳ Осталось (legacy-шимы v0.1.7-стиля)

| Строка | Текущий вызов | Куда переводить |
| --- | --- | --- |
| [263](src/core/base/bitrix-base-api.ts#L263) | `bx.callMethod(method, data, -1)` (private `callMethod`) | `actions.v2.call.make` |
| [302](src/core/base/bitrix-base-api.ts#L302) | `bx.callMethod(method, data, -1)` (public `call`) | `actions.v2.call.make` |
| [342](src/core/base/bitrix-base-api.ts#L342) | `bx.callBatchByChunk(commands, false)` | `actions.v2.batchByChunk.make` |
| [372](src/core/base/bitrix-base-api.ts#L372) | `bx.callBatch(this.cmdBatch, false)` | `actions.v2.batch.make` |

Третий аргумент `-1` — это старый `start`/пагинация из v0.1.7, в v2 он не нужен.

### План перехода (по одному шагу, с проверкой)

**Шаг 1 — одиночные вызовы (низкий риск).**

```ts
// было
const r = (await this.bx.callMethod(method, data as object, -1)) as Result;
const response = r.getData() as IBitrixResponse<...>;

// стало
const r = await this.bx.actions.v2.call.make<TBXResponse<...>>({
    method,
    params: data as object,
});
const response = r.getData() as IBitrixResponse<...>;
```

**Шаг 2 — batch (форма аргументов другая!).**

v2 принимает `{ calls, options }`, а не `Record<cmd, {method, params}>`:

```ts
const response = await this.bx.actions.v2.batch.make<T>({
    calls: this.cmdBatch,          // {cmd: {method, params}} поддерживается как именованные команды
    options: { isHaltOnError: false, returnAjaxResult: true },
});
```

⚠️ Форма **результата** тоже меняется (`CallBatchResult<T>`), поэтому разбор
ответа и типы `IBitrixBatchResponseResult` придётся править синхронно.
Максимум 50 команд в одном batch.

**Шаг 3 — прогнать реальный сценарий** (см. плейбук ниже), а не только typecheck.

### Отдельно: убрать dev-фолбэк на проде

Сейчас при неудаче `user.current` приложение молча продолжает с `TESTING_USER`
(константа из `apps/*/modules/app/consts/app-global.ts`). На проде (`IS_PROD`)
это показывает данные под чужой личиной. Правильно — показывать ошибку
авторизации. Задача остаётся открытой.

Мёртвые импорты `bxAPI`/`getBxService` из `@workspace/api` в
`bitrix-base-api.ts` тоже стоит убрать — они тянут второй SDK в бандл впустую.

---

## 5. Плейбук диагностики

Когда фрейм-REST «не работает», идите строго по порядку — это отсекает
95% ложных гипотез за пару минут.

**1. Включите родной логгер SDK** (временно):

```ts
import { LoggerFactory } from '@bitrix24/b24jssdk';
b24.setLogger(LoggerFactory.createForBrowser('bitrix', true));
```

Он печатает `post/send` (реальный URL и параметры) и `post/response`/`post/catchError`
(реальный статус и тело). Без него ошибка замаскирована под 500.

**2. Дёрните `server.time`** — ему не нужны никакие права.

- упал → проблема в **транспорте/пайплайне** (лимитер, сеть), не в правах;
- прошёл, а `user.current` упал → проблема в **правах (scope)**.

**3. Дёрните `scope`** — вернёт список выданных приложению прав.
Для `user.current` нужен `user` / `user_brief` / `user_basic`.

**4. Сырой `fetch` мимо SDK** — изолирует SDK от сети:

```ts
const auth = b24.auth.getAuthData();
const base = new URL(auth.domain).origin;
await fetch(`${base}/rest/user.current?auth=${auth.access_token}`, { method: 'POST' });
```

- HTTP 200 → сеть и CORS в порядке, виноват **SDK/конфиг**;
- `Failed to fetch` → cross-origin/сеть.

**5. Разверните `error.originalError`** (см. 3.3) — статус `500` сам по себе
не значит ничего.

### Что НЕ является причиной (проверено живьём)

- ❌ Две версии SDK в `node_modules` — сами по себе не конфликтуют.
- ❌ CORS с `*.vercel.app` — сырой `fetch` отдал HTTP 200.
- ❌ Нехватка scope — `scope` вернул `user`, `user_brief`, `user_basic`.
- ❌ `callMethod` vs `actions.v2` — один и тот же транспорт.
- ❌ Гонка с `initializeB24Frame()` — `await` гарантирует готовность.
- ⚠️ `WARN: message rejected: unexpected origin` в консоли — **шум**, а не
  причина: фрейм-контроллер отбрасывает posted-сообщения не от портала.

---

## 6. Чек-лист для нового кода

- [ ] Инициализация фрейма — только `await initializeB24Frame()`, без тюнинга лимитов.
- [ ] REST — только `actions.v2.*` / `actions.v3.*`, без `callMethod`/`callBatch`.
- [ ] `getData()` разбирается через `?.` — иначе упадёт прод-сборка.
- [ ] Ошибки логируются с развёрнутым `originalError`.
- [ ] Текущий пользователь берётся из фрейма, а не с бэка.
- [ ] Импорты marketplace — только из барреля `@workspace/bitrix`.
- [ ] Новый Bitrix-метод добавляется по бэковому гайду
      (`namespace` + `entity` + `method`, схема, repository, service) —
      никаких строковых `'crm.xxx.yyy'` в бизнес-коде.
- [ ] Изменение проверено **живым прогоном во фрейме**, а не только typecheck.
