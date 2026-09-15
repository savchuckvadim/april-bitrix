# entities/ai-analytics — AI-аналитика ОП

Сущность вкладки «AI аналитика» KPI-отчёта. Бэк — `apps/kpi-report-sales`
(`/ai-analytics/*`), клиент — только через `@workspace/nest-kpi-report-sales-api`
в `lib/api/ai-analytics-helper.ts` (единственное место импорта пакета).

## Секции стора (`model/ai-analytics-slice.ts`)

| Секция      | Ручка          | Режим                       | Ключ запроса                        |
| ----------- | -------------- | --------------------------- | ----------------------------------- |
| `settings`  | `settings/get` | sync                        | `domain\|requester`                 |
| `pulse`     | `pulse`        | sync (опрос 5 с при queued) | `domain\|requester`                 |
| `agenda`    | `agenda`       | sync                        | `domain\|requester`                 |
| `overview`  | `overview`     | **очередь + WS**            | `…\|from\|to\|sortedIds`            |
| `attention` | `attention`    | sync над кэшем обзора       | как overview                        |
| `byType`    | `by-type`      | sync-срез обзора            | как overview + `\|callType\|layout` |

Каждая секция — `AiSection<T>`: `status`, `data`, `requestKey` (наш ключ,
`lib/ai-request-key.util.ts`), `serverKey` (ключ кэша сервера), `jobStatus`
(`queued|processing` у тяжёлых), `queuedAttempts`, `error`. Ответ с чужим
`requestKey` редьюсер отбрасывает — гонки при смене фильтра не перетирают
данные.

Плюс: `feedback` (реакции), `levels` (сохранение уровней), UI-настройки
`selectedCallType` / `typesLayout` (персист в ui-settings blob, ключ `ai`)
и `typesDrawerOpen`.

## Thunks (`model/ai-analytics-*.thunks.ts`)

`model/ai-analytics-thunks.ts` — только реэкспорт (импорты listeners,
тестов и `feature/ai-flags` не зависят от разбиения):

- `ai-analytics-thunks.shared.ts` — экземпляр helper, тайминги
  (`AI_POLL_INTERVAL_MS`, `AI_QUEUED_TIMEOUT_MS`, `AI_QUEUED_MAX_ATTEMPTS`),
  `selectAiRequester`;
- `ai-analytics-sync.thunks.ts` — settings / pulse / agenda (опрос при
  queued), реакции `sendAiFeedback` / `sendAiView`, «Обновить»;
- `ai-analytics-queued.thunks.ts` — overview / attention / byType,
  `resumeAiQueuedSections` / `failAiQueuedSections` по WS,
  `recalcAiOverview`, `saveAiLevels`.

## Тяжёлые ручки: очередь + WS (`model/ai-analytics-queued.thunks.ts`)

1. `fetchAiOverview()` считает периметр `selectAiOverviewScope`: requester,
   период глобального фильтра (обрезка до 3 мес. — `lib/ai-period.util.ts`),
   выбранные менеджеры `department.current`.
2. POST с `socketId` WS-клиента приложения. `ready` — данные; `queued` /
   `processing` — секция остаётся в `loading` с `serverKey` и ждёт.
3. WS `ai-analytics:overview:done {requestKey}` (`listeners/ai-ws.listener.ts`)
   → `resumeAiQueuedSections(key)` повторяет тот же POST у всех секций, что
   ждали этот ключ (attention / by-type без обзора отвечают его ключом), и
   получает `ready` из кэша в своём периметре. Сам обзор по WS не приходит.
4. Таймаут 90 с без WS → повторный POST по тому же `requestKey`; после
   `AI_QUEUED_MAX_ATTEMPTS` (3) подряд — ошибка «слишком долго».
5. WS `…:error` → `failAiQueuedSections` — секции с этим ключом в ошибку.
6. `{ force: true }` («Пересчитать», `recalcAiOverview`) шлёт `forceRefresh`
   и обходит кэш и error-конверт (120 с). `{ resume: true }` — служебный
   повтор без pending и без forceRefresh.

## Listeners (`model/listeners`)

- `ai-refetch.listener.ts`: `setSavedFilter` → освежить уже открытые секции;
  `levelsSaved` → обзор и «Внимание» с `force`; открытие drawer / смена
  типа / раскладки → `fetchAiByType`.
- `ai-ws.listener.ts`: подписка на done/error после `setAppData`.
- Портальный флаг — `feature/ai-flags`.

## lib

- `ai-call-types.data.ts` — подвкладки типов (+ `objections`), гард blob.
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

`ai-analytics-slice` (Часть 1), `ai-overview-thunks` (ключи, очередь, done,
таймаут, by-type, уровни), `ai-ws.listener`, `ai-refetch.listener`,
`ai-format.util` (форматирование, период, группировка, форма уровней,
опции подвкладок с «Все» первой), `ai-by-type.util` (группировка строк
среза по менеджеру, гард `all`, подзаголовок), `ai-feedback.util`
(причина «Не согласен»: обрезка до 300, пустая → `undefined`).

## Доступ

Вкладка видна только руководителям (`EAccessFeature.AI_TAB` в
`shared/access`: оба флага И (суперюзер | `headOf`)); рядовой менеджер
вкладку не видит — решение владельца 07.09.2026. Режим «менеджер видит
себя» вернёт портальная настройка `selfViewEnabled` из `settings/get`
(бэк добавляет поле).
