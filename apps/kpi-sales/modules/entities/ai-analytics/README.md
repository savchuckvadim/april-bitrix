# entities/ai-analytics — AI-аналитика ОП

Сущность вкладки «AI аналитика» KPI-отчёта. Бэк — `apps/kpi-report-sales`
(`/ai-analytics/*`), клиент — только через `@workspace/nest-kpi-report-sales-api`
в `lib/api/ai-analytics-helper.ts` (единственное место импорта пакета).

## Секции стора (`model/ai-analytics-slice.ts`)

| Секция      | Ручка           | Режим                       | Ключ запроса                        |
| ----------- | --------------- | --------------------------- | ----------------------------------- |
| `settings`  | `settings/get`  | sync                        | `domain\|requester`                 |
| `pulse`     | `pulse`         | sync (опрос 5 с при queued) | `domain\|requester`                 |
| `agenda`    | `agenda`        | sync                        | `domain\|requester`                 |
| `overview`  | `overview`      | **очередь + WS**            | `…\|from\|to\|sortedIds`            |
| `attention` | `attention`     | sync над кэшем обзора       | как overview                        |
| `byType`    | `by-type`       | sync-срез обзора            | как overview + `\|callType\|layout` |
| `dailyPlan` | `plan/daily`    | sync (кэш бэка 180 с)       | `…\|#\|plan\|managerId\|date`       |
| `brief`     | `brief`         | **очередь + WS**            | как overview (периметр)             |
| `ropMark`   | `rop-mark/list` | sync (+ `pick` при пустом)  | `…\|#\|rop-mark\|weekKey\|date`     |
| `style`     | `manager/style` | sync (снапшот ночного шага) | `…\|#\|style\|managerId\|month`     |
| `about[e]`  | `about`         | sync, кэш по ручке `e`      | `…\|#\|about\|endpoint`             |

Каждая секция — `AiSection<T>`: `status` (idle | loading | ready | error),
`data`, `requestKey` (наш ключ, `lib/ai-request-key.util.ts`), `serverKey`
(ключ кэша сервера), `jobStatus` (`queued|processing` у тяжёлых),
`queuedAttempts`, `error`. Ответ с чужим `requestKey` редьюсер отбрасывает —
гонки при смене фильтра не перетирают данные. `about` — не одна секция, а
`Partial<Record<AiAboutEndpoint, AiSection<AiAbout>>>` (кэш по ручке
`overview | plan/daily | brief | manager/style`).

Рядом с секциями Фазы 2 лежат запомненные запросы (нужны UI в
loading/error): `dailyPlanQuery { managerId, date? }`, `styleQuery
{ managerId, month? }`, `ropMarkQuery { weekKey?, date? }`; и состояние
записи метки `ropMarkSave { pending: transcriptionId | null, error, lastSaved
{ id, replaced, blind } }` — 400/403 при сохранении не ломают список недели.

Плюс: `feedback` (реакции), `levels` (сохранение уровней), UI-настройки
`selectedCallType` / `typesLayout` (персист в ui-settings blob, ключ `ai`)
и `typesDrawerOpen`.

HTTP-ошибки (403 «план дня выключен», 403 «вне периметра», 400 «звонок вне
подбора») не падают: `lib/ai-error.util.ts` достаёт текст сервера из тела
`{ resultCode: 1, message }` и кладёт его в `error` секции.

## Thunks (`model/ai-analytics-*.thunks.ts`)

`model/ai-analytics-thunks.ts` — только реэкспорт (импорты listeners,
тестов и `feature/ai-flags` не зависят от разбиения):

- `ai-analytics-thunks.shared.ts` — экземпляр helper, тайминги
  (`AI_POLL_INTERVAL_MS`, `AI_QUEUED_TIMEOUT_MS`, `AI_QUEUED_MAX_ATTEMPTS`),
  `selectAiRequester`, `selectAiIsLeader` (`department.isHeadManager`);
- `ai-analytics-sync.thunks.ts` — `loadSection` (общий загрузчик: ключ =
  requester + `extra`, гард дублей, опрос при queued), settings / pulse /
  agenda, **`fetchAiDailyPlan({ managerId, date? }, force?)`** (гейт
  `settings.data.dailyPlanEnabled === false` → error с подсказкой без
  запроса; 403 сервера → error с его текстом),
  **`fetchAiStyleProfile({ managerId, month? }, force?)`** (состояние
  карточки `ready | few_data | opt_out` — в `data.status`; 403 — error),
  реакции `sendAiFeedback` / `sendAiView`, «Обновить»;
- `ai-analytics-queued.thunks.ts` — overview / attention / byType /
  **`fetchAiBrief(options)`**, `resumeAiQueuedSections` /
  `failAiQueuedSections` по WS, `recalcAiOverview`, `saveAiLevels`;
- `ai-analytics-rop-mark.thunks.ts` — **`fetchAiRopMarkWeek(query?,
force?)`**: `list`; если подбора ещё нет (`generatedAt === ''`,
  `calls: []` — `isAiRopMarkWeekEmpty`) и requester — руководитель → `pick`
  → `list`; **`saveAiRopMark(input)`** → `true` и повторный `list` той же
  недели (метка раскрывает `aiCallType`/`aiScore`), 400/403 → текст в
  `ropMarkSave.error`, `false`;
- `ai-analytics-about.thunks.ts` — **`fetchAiAbout(endpoint, force?)`**:
  повторно не запрашивает, пока секция ручки ready.

## Тяжёлые ручки: очередь + WS (`model/ai-analytics-queued.thunks.ts`)

1. `fetchAiOverview()` / `fetchAiBrief()` считают периметр
   `selectAiOverviewScope`: requester, период глобального фильтра (обрезка
   до 3 мес. — `lib/ai-period.util.ts`), выбранные менеджеры
   `department.current`.
2. POST с `socketId` WS-клиента приложения. `ready` — данные; `queued` /
   `processing` — секция остаётся в `loading` с `serverKey` и ждёт.
3. WS `ai-analytics:overview:done {requestKey}` / `ai-analytics:brief:done
{requestKey}` (`listeners/ai-ws.listener.ts`) →
   `resumeAiQueuedSections(key)` повторяет тот же POST у всех секций, что
   ждали этот ключ (attention / by-type без обзора отвечают его ключом; у
   резюме свой ключ по packHash), и получает `ready` из кэша в своём
   периметре. Сами данные по WS не приходят.
4. Таймаут 90 с без WS → повторный POST по тому же `requestKey`; после
   `AI_QUEUED_MAX_ATTEMPTS` (3) подряд — ошибка «слишком долго».
5. WS `…:error` → `failAiQueuedSections` — секции с этим ключом в ошибку
   (текст сервера либо `AI_QUEUED_ERROR_MESSAGES[section]`).
6. `{ force: true }` («Пересчитать», `recalcAiOverview`; «Пересобрать
   резюме» — `fetchAiBrief({ force: true })`) шлёт `forceRefresh` и обходит
   кэш и error-конверт. `{ resume: true }` — служебный повтор без pending и
   без forceRefresh.

Резюме (`AiBrief`): `source = template` и `reason` сохраняются как есть —
UI показывает подпись причины шаблона.

## Listeners (`model/listeners`)

- `ai-refetch.listener.ts`: `setSavedFilter` → освежить уже открытые секции
  (pulse, agenda, overview, attention, byType, **brief**); `levelsSaved` →
  обзор и «Внимание» с `force`; открытие drawer / смена типа / раскладки →
  `fetchAiByType`.
- `ai-ws.listener.ts`: подписка на `overview:done|error` и
  `brief:done|error` после `setAppData` (`AI_WS_EVENTS`).
- Портальный флаг — `feature/ai-flags`.

## lib

- `ai-call-types.data.ts` — подвкладки типов (+ `objections`), гард blob.
- `ai-readiness.data.ts` — подписи/тон режимов готовности; подписи кодов
  причин `ReadinessDto.reasons` (`formatAiReadinessReason(s)`: статические
  коды, коды с гейтом `history-months-below-3` и т.п., запасная подпись
  для неизвестного); `formatBetaCountdown(readiness.betaCountdown)` — «до
  оценки β осталось ≈ N презентаций / M месяцев»; `pluralRu`.
- `ai-error.util.ts` — `aiErrorMessage` / `aiServerMessage` /
  `aiErrorStatus`: текст и статус HTTP-ошибки axios.
- `ai-request-key.util.ts` — ключ запроса; `extra` — параметры секции.
- `ai-overview.data.ts` — сигналы, уровни, корзины, подписи опор/категорий.
- `ai-overview.util.ts` — группировка строк по структуре, сортировка,
  выбор разделов для широкой раскладки, подсказки.
- `ai-by-type.util.ts` — срез by-type: группировка строк по менеджеру
  (режим «Все типы» — строка на пару менеджер × тип, имя один раз),
  подзаголовок drawer. Режим `all` уходит на бэк как есть
  (`resolveAiByTypeCallType` — тождество), ответ несёт `totalsByType`
  вместо `totals`, у long-строк — `callType`.
- `ai-attention.util.ts` — строки «Основание» карточки.
- `ai-score.util.ts` / `ai-finance.util.ts` — форматирование оценок 1–10,
  %, денег, плана CRM; тона полос.
- `ai-levels.util.ts` — форма уровней ↔ payload `settings/save`.
- `ai-feedback.util.ts` — причина «Не согласен»: лимит 300 символов,
  обрезка, нормализация (пустая → `undefined`), подпись счётчика.
- `ai-metric.util.ts`, `ui/AiMetricValue.tsx` — честное «мало данных»
  (`none` → бэйдж, `low` → пунктир), `kind: rate|score|pct|count`.

## Тесты (`__tests__`)

`ai-analytics-slice` (статусы, секции Фазы 2, resetData, ключ с `extra`),
`ai-overview-thunks` (ключи, очередь, done, таймаут, by-type, уровни),
`ai-brief-thunks` (queued → WS done → повторный POST → ready, error,
template/reason, force, таймаут, смена периметра), `ai-plan-style-thunks`
(план дня: ready, 403, гейт настройки; стиль: ready, opt_out, 403),
`ai-rop-mark-thunks` (list, pick при пустом подборе только руководителю,
save → повторный list, 400/403), `ai-about-thunks` (кэш по ручке),
`ai-readiness.util` (подписи причин, счётчик β, `aiErrorMessage`),
`ai-ws.listener` (события обзора и резюме), `ai-refetch.listener`,
`ai-format.util`, `ai-by-type.util`, `ai-feedback.util`. Общий стор для
thunks Фазы 2 — `ai-test-store.ts` (`leader`, `period`), фикстуры DTO —
`ai-fixtures.ts` (в т.ч. `httpError(status, message)`).

## Доступ

Вкладка видна только руководителям (`EAccessFeature.AI_TAB` в
`shared/access`: оба флага И (суперюзер | `headOf`)); рядовой менеджер
вкладку не видит — решение владельца 07.09.2026. Режим «менеджер видит
себя» вернёт портальная настройка `selfViewEnabled` из `settings/get`
(бэк добавляет поле). Слепая оценка (`rop-mark/*`) — только руководителям
cup/op/group: менеджеру сервер отвечает 403 даже при `selfViewEnabled`.
