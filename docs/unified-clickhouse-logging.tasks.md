# Задача: объединённое логирование front → ClickHouse бэка

> Статус: **не начато**. Документ — план работ; чекбоксы отмечаем по мере выполнения.

## 1. Цель

Все приложения фронт-монорепы пишут логи в **тот же ClickHouse**, что и бэк-монорепа
(`back/infra` → база `logs`, таблица `logs.app_logs`), и просматриваются в **той же
Grafana** (datasource «ClickHouse Logs» уже настроен на бэке).

Что это даёт:

- один сток логов на весь продукт: кросс-сервисный поиск «что происходило в 14:03»
  по бэку и фронту одним SQL/дашбордом;
- один ретеншен (TTL 30 дней, партиции чистит сам ClickHouse) — диск не переполняется;
- умирает текущий зоопарк фронта: pino → файл `/app/logs/server.log` +
  недоделанные loki/promtail (закомментированы в `docker-compose.yml`).

Два потока логов фронта — **разные задачи внутри этой**:

1. **Server-side** (SSR, route handlers, middleware, server actions) — Node-процесс,
   пишет в ClickHouse напрямую (батчами), как это делает `@lib/logger` на бэке.
2. **Browser-side** (ошибки/события в браузере) — в ClickHouse напрямую **нельзя**
   (утекут креды). Только через ingest-эндпоинт `POST /api/logs` внутри самого
   Next-приложения, с валидацией и rate-limit.

## 2. Контекст: что уже есть

### На бэке (переиспользуем, НЕ трогаем без нужды)

| Что | Где |
|---|---|
| Схема таблицы `logs.app_logs` | `back/infra/clickhouse/init/01-logs.sql` |
| Референс-транспорт (батчинг, fail-open, потолки буфера) | `back/libs/logger/src/transports/clickhouse.transport.ts` |
| Сервис clickhouse в compose (сеть `app-network`, порт наружу НЕ опубликован) | `back/infra/compose/docker-compose.prod.yml` |
| Гайд по логированию бэка | `back/docs/LOGGING.md` |

Схема таблицы (это **общий контракт**, владелец — back-репо, фронт её не меняет):

```sql
CREATE TABLE logs.app_logs (
    timestamp DateTime64(3),
    app       LowCardinality(String),   -- имя приложения: у фронта 'front-<app>'
    env       LowCardinality(String),   -- 'production' | 'development'
    level     LowCardinality(String),   -- error | warn | log | debug | verbose
    context   String,                   -- логический контекст ('PbxHelper', 'api/logs')
    message   String,
    meta      String,                   -- JSON-строка: сюда кладём ВСЁ специфичное
    trace     String                    -- stack trace
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (app, timestamp)
TTL toDateTime(timestamp) + INTERVAL 30 DAY DELETE
```

Схема мультиприложенческая по построению (`app` + `ORDER BY (app, timestamp)`),
поэтому **отдельная таблица/база для фронта не нужна**. Браузерная специфика
(url, userAgent, userId, domain, sessionId) — внутрь `meta` (JSON), не в колонки.

### На фронте (текущее состояние — что мигрируем/выносим)

- `apps/event-sales|event-service|konstructor/app/lib/logs/logServer.ts` —
  локальный pino, пишет в файл `LOG_FILE_PATH` (`/app/logs/server.log`);
  сигнатура `logServer(level, context, message, domain, userId)`.
- Те же приложения имеют `app/api/admin/logs/route.ts` (читалка файла логов) —
  после миграции станет не нужна (смотрим в Grafana).
- `docker-compose.prod.yml`: у всех сервисов volume `./logs:/app/logs` и env
  `LOG_FILE_PATH` — рудименты файлового логирования.
- `loki/`, `promtail/`, `loki-data/` в корне + закомментированные сервисы в
  `docker-compose.yml` — легаси, подлежит удалению.
- Общего логгер-пакета в `packages/*` нет — его и создаём.

## 3. Архитектура решения

```
 Next-приложение (front-<app>)
 ──────────────────────────────
 server-код ──► logger из @workspace/logger ──► stdout (JSON, всегда)
 (SSR/route/action)         │
                            └──► ClickHouseBatcher ──► http://clickhouse:8123
                                 (если LOG_CLICKHOUSE_ENABLED=true)   logs.app_logs

 browser-код ──► POST /api/logs (route handler из @workspace/logger)
                  │  zod-валидация + rate-limit + потолок payload
                  └──► тот же logger (meta.source='browser')
```

Ключевые решения (обсуждены, зафиксированы):

- **Тот же инстанс CH, та же таблица.** Различение — по колонке `app`:
  `front-bitrix`, `front-admin`, `front-kpi-sales`, `front-kpi-service`,
  `front-konstructor`, `front-event-sales`, `front-event-service`, `front-web`
  (совпадает с именами сервисов в `docker-compose.prod.yml`).
- **Сетевая связность** — front-контейнеры подключаются к docker-сети бэка как
  external и ходят на `clickhouse:8123` по внутренней сети. Порт CH наружу
  по-прежнему не публикуется (см. этап 0).
- **Свой транспорт, не winston.** На фронте pino/console; из бэковского
  `clickhouse.transport.ts` портируем не winston-обёртку, а **ядро**: батчинг,
  fail-open, двойной потолок буфера, truncate полей, формат timestamp.
- **Без pino worker-transport.** Транспорты pino живут в worker-потоке — в
  Next standalone это лишний источник проблем (упаковка воркера, shutdown).
  Делаем простой класс `ClickHouseBatcher` + тонкий фасад-логгер поверх него,
  вызовы синхронные, отправка — фоновым таймером.
- **Fail-open всегда:** ClickHouse лёг → батч дропается с `console.error`,
  приложение не тормозит и не падает. stdout-лог остаётся второй линией
  (docker json-file ротация).
- **Схему таблицы фронт не меняет.** Понадобится новое поле — сначала PR в back
  (`infra/clickhouse/init/01-logs.sql` + ALTER на живой таблице), потом фронт.

## 4. Этапы

### Этап 0 — сеть и доступ (прод-инфраструктура, включает мини-PR в back)

Предпосылка: front и back деплоятся на **один сервер** (проверить! — если серверы
разные, см. «План Б» ниже).

- [ ] **Выяснить фактическое имя сети бэка на сервере.** В
      `back/infra/compose/docker-compose.prod.yml` сеть `app-network` объявлена
      без явного `name:` → docker создаёт её как `<project>_app-network`, где
      project зависит от того, откуда запускали compose. На сервере:
      `docker inspect mono-clickhouse -f '{{json .NetworkSettings.Networks}}'`.
- [ ] **PR в back: дать сети явное имя.** В `networks:` prod/dev compose добавить
      `name: april-back` (или согласованное). Без этого имя сети — деталь
      реализации чужого репо, на которую нельзя ссылаться из front-compose.
      Это единственное изменение в back-репо.
- [ ] **Убедиться, что креды CH известны:** `CLICKHOUSE_USER/PASSWORD/DB` живут в
      корневом `/.env` бэка на сервере. Решить, копируем те же креды во
      front-`.env`, или (лучше, но опционально) заводим в CH отдельного юзера
      `front_writer` с правами INSERT на `logs.app_logs` — тогда компрометация
      фронта не даёт SELECT по всем логам. Отдельный юзер = ещё один init-скрипт
      в back (`infra/clickhouse/init/02-users.sql`) — решить при ревью PR в back.

**План Б (если серверы разные):** сеть external невозможна; тогда на сервере бэка
публикуем CH только на `127.0.0.1:8123` и выставляем его наружу через
reverse-proxy c TLS + basic auth (или SSH-туннель). Это отдельное решение —
зафиксировать в этом документе, если сценарий подтвердится.

### Этап 1 — пакет `packages/logger` (`@workspace/logger`)

Новый workspace-пакет. Единственное место на фронте, которое знает про
`@clickhouse/client`.

```
packages/logger/
  package.json            # name: @workspace/logger; deps: @clickhouse/client, zod
  src/
    config.ts             # чтение env → LoggerConfig (см. таблицу env ниже)
    clickhouse-batcher.ts # порт ядра back/libs/logger/src/transports/clickhouse.transport.ts
    logger.ts             # фасад: createLogger({ app }) → { info, warn, error, debug }
    browser-ingest.ts     # фабрика route handler'а для POST /api/logs
    client.ts             # БРАУЗЕРНЫЙ хелпер: logBrowser(level, ctx, msg, meta) → fetch('/api/logs')
    index.ts              # server-экспорты
    index.client.ts       # browser-экспорты ('use client'-безопасные, без node-зависимостей)
```

- [ ] **`clickhouse-batcher.ts`** — переносим 1-в-1 инварианты референса
      (`back/libs/logger/src/transports/clickhouse.transport.ts`):
      - буфер в памяти, flush по `maxBatch` (деф. 100) и по таймеру
        `flushIntervalMs` (деф. 5000), `timer.unref()`;
      - двойной потолок: `MAX_BUFFER = 5000` записей И `MAX_BUFFER_BYTES = 16MB`,
        drop-oldest;
      - truncate: поля до 8192 симв., trace до 16384;
      - `timestamp` в формате `YYYY-MM-DD HH:mm:ss.SSS` (UTC, как у бэка —
        `toISOString().replace('T',' ').replace('Z','')`);
      - insert через `@clickhouse/client` `format: 'JSONEachRow'` в таблицу
        `app_logs`;
      - ошибки insert → `console.error` + дроп батча (fail-open, без рекурсии);
      - `dispose()`: остановить таймер, дожать буфер, закрыть клиент.
- [ ] **`logger.ts`** — фасад:
      - `createLogger({ app: string })`; уровень из `LOG_LEVEL`, глобальный
        выключатель `LOGS_ENABLED`;
      - каждый вызов: (а) JSON-строка в stdout (всегда), (б) строка в батчер
        (если `LOG_CLICKHOUSE_ENABLED=true`);
      - `env` = `process.env.NODE_ENV`;
      - **синглтон через `globalThis`** — в dev Next пересоздаёт модули при HMR,
        без guard'а получим утечку таймеров и множественные батчеры:
        ```ts
        const g = globalThis as { __appLogger?: AppLogger };
        export const getLogger = (app: string) => (g.__appLogger ??= createLogger({ app }));
        ```
      - guard от импорта в браузер: `if (typeof window !== 'undefined') throw` —
        server-экспорты не должны попадать в клиентский бандл.
- [ ] **Graceful shutdown**: экспортировать `registerLoggerShutdown()` —
      подписка на `SIGTERM`/`SIGINT`/`beforeExit` → `batcher.dispose()`.
      Вызывать из `instrumentation.ts` каждого приложения (Next поддерживает
      хук `register()`); иначе хвост буфера (<5 сек логов) теряется при рестарте
      контейнера — некритично, но дёшево починить.
- [ ] **`browser-ingest.ts`** — фабрика хендлера:
      ```ts
      // apps/<app>/app/api/logs/route.ts
      import { createBrowserLogIngest } from '@workspace/logger';
      export const POST = createBrowserLogIngest({ app: 'front-<app>' });
      ```
      Внутри:
      - zod-схема: `{ level: 'info'|'warn'|'error', context: string,
        message: string, meta?: object }`, батч до 20 записей за запрос;
      - потолок payload 64KB (раньше зod'а — по `content-length`), лишнее → 413;
      - **rate-limit** in-memory token-bucket по IP: деф. 60 записей/мин,
        превышение → 429 без записи (браузерный шторм не зальёт таблицу);
      - всё записанное получает `meta.source = 'browser'` + `meta.url`,
        `meta.userAgent` (из заголовков), уровень `debug` от браузера не
        принимаем;
      - ответ всегда 204 (кроме 413/429) — браузеру не нужно тело.
- [ ] **`client.ts`** (браузерная сторона) — `logBrowser(...)`: копит записи и
      шлёт батчем раз в ~10 сек / по `visibilitychange` через
      `navigator.sendBeacon` (переживает закрытие вкладки), fallback `fetch`.
      Сюда же — опциональный `initBrowserErrorHook()`: подписка на
      `window.onerror` + `unhandledrejection` → `logBrowser('error', ...)`.
- [ ] **Тесты** (vitest, по образцу `back/libs/logger/src/__tests__`):
      батчинг по размеру/таймеру, drop-oldest при потолках, truncate, fail-open
      при падающем sink (sink подменяется фейком — контракт `insert/close`),
      zod-валидация и rate-limit ingest-хендлера.

### Этап 2 — подключение в приложениях

Порядок внедрения: сначала **одно пилотное** приложение (предлагаю
`event-service` — там уже есть `logServer` и живой трафик логов), затем остальные.

Для каждого из 8 приложений (`bitrix, admin, kpi-sales, kpi-service, konstructor,
event-sales, event-service, web`):

- [ ] добавить `@workspace/logger` в deps;
- [ ] `instrumentation.ts`: `registerLoggerShutdown()`;
- [ ] `app/api/logs/route.ts`: `createBrowserLogIngest({ app: 'front-<app>' })`;
- [ ] server-код: заменить точечные `console.log/error` в route handlers и
      server actions на логгер (**не** массовой заменой — только осмысленные
      точки: ошибки, внешние вызовы, бизнес-события);
- [ ] `apps/<app>/.env.example`: добавить блок ClickHouse-переменных (см. §5).

Миграция существующего файлового логирования (`event-sales`, `event-service`,
`konstructor`):

- [ ] `app/lib/logs/logServer.ts` — оставить файл и сигнатуру
      `logServer(level, context, message, domain, userId)`, но внутри
      делегировать в `@workspace/logger` (`domain`/`userId` → `meta`).
      Call-sites не трогаем — миграция бесшовная;
- [ ] `app/api/admin/logs/route.ts` (читалка server.log) — пометить deprecated;
      удалить после того, как убедимся, что смотрим логи в Grafana (этап 4);
- [ ] pino из deps этих приложений убрать, когда файловый лог отключим.

### Этап 3 — compose, env, CI

- [ ] **`docker-compose.prod.yml`**: добавить внешнюю сеть бэка и подключить к
      ней все front-сервисы (сеть `monitoring` оставить как есть):
      ```yaml
      x-front-common: &front-common
        networks:
          - monitoring
          - back-network
      # ...
      networks:
        monitoring:
          driver: bridge
          name: monitoring
        back-network:
          external: true
          name: april-back   # имя из этапа 0 (PR в back)
      ```
      ⚠️ external-сеть должна существовать до `up` — если бэк-стек не поднят,
      деплой фронта упадёт. Это осознанная связность; на dev-машине без бэка
      сеть создаётся руками: `docker network create april-back`.
- [ ] **env на сервере** — в `apps/<app>/.env` каждого деплоящегося приложения
      (или общий блок в серверном `.env` + прокидка через `environment:` в
      compose — решить при реализации; у фронта нет двухуровневой env-модели
      бэка, так что проще в `apps/<app>/.env`):
      ```env
      LOG_CLICKHOUSE_ENABLED=true
      CLICKHOUSE_URL=http://clickhouse:8123
      CLICKHOUSE_DB=logs
      CLICKHOUSE_USER=front_writer        # или default — по решению этапа 0
      CLICKHOUSE_PASSWORD=***
      ```
- [ ] **CI (`.github/workflows/deploy-front-prod.yml`) менять не нужно** — все
      переменные runtime (env_file), в образ ничего не зашивается. Проверить
      только, что изменение `docker-compose.prod.yml` триггерит пересборку
      (уже в paths) и что `git reset --hard` на сервере не снесёт локальные
      env (они в .gitignore — ок).
- [ ] **dev-режим**: в `docker-compose.yml` (dev) ClickHouse не добавляем;
      локально по умолчанию `LOG_CLICKHOUSE_ENABLED=false` → только stdout.
      Кому нужно потыкать CH локально — поднимает `back/infra/compose/
      docker-compose.base.yml` (там уже есть clickhouse с той же схемой) и
      ставит `CLICKHOUSE_URL=http://localhost:8123`.

### Этап 4 — наблюдение и приёмка

- [ ] В Grafana бэка (datasource «ClickHouse Logs») — панель/дашборд «Front logs»:
      фильтр `app LIKE 'front-%'`, разбивка по `level`, топ `context` по ошибкам.
      Provisioning-дашборды живут в back-репо (`infra/grafana/provisioning`) —
      либо PR туда, либо дашборд руками (решить: руками быстрее, provisioning —
      правильнее).
- [ ] Смоук на проде (пилотное приложение):
      1. задеплоить, открыть страницу → серверный лог виден:
         `SELECT * FROM logs.app_logs WHERE app='front-event-service' ORDER BY timestamp DESC LIMIT 20`;
      2. кинуть браузерную ошибку (тестовая кнопка/консоль) → запись с
         `meta.source='browser'`;
      3. остановить ClickHouse → приложение живёт, в docker-логах
         `ClickHouseTransport: insert failed...`, после старта CH логи снова идут
         (fail-open подтверждён);
      4. `docker stats` фронт-контейнера при лежащем CH — память не растёт
         (потолки буфера работают).
- [ ] Нагрузочная прикидка ingest: `POST /api/logs` c батчем 20 записей ×
      частый клиент → 429 после лимита.

### Этап 5 — зачистка легаси

Только после приёмки этапа 4 на всех приложениях:

- [ ] удалить `loki/`, `promtail/`, `loki-data/` и закомментированные сервисы
      loki/promtail + volume `loki-data` из `docker-compose.yml`;
- [ ] убрать `volumes: ./logs:/app/logs` и `LOG_FILE_PATH` из
      `docker-compose.prod.yml` (и `x-front-env`);
- [ ] удалить `app/api/admin/logs/route.ts` и файловый вывод в `logServer.ts`
      (сам фасад `logServer()` можно оставить как алиас);
- [ ] удалить pino из deps приложений;
- [ ] обновить README фронта: раздел «Логи» → ссылка на этот документ и Grafana.

## 5. Переменные окружения (итоговая таблица)

| Переменная | Дефолт | Назначение |
|---|---|---|
| `LOGS_ENABLED` | `true` | глобальный выключатель логгера |
| `LOG_LEVEL` | prod: `log`, dev: `debug` | минимальный уровень (совместимо с бэком) |
| `LOG_CLICKHOUSE_ENABLED` | `false` | писать ли в ClickHouse |
| `CLICKHOUSE_URL` | — | `http://clickhouse:8123` в docker; `http://localhost:8123` локально |
| `CLICKHOUSE_DB` | `logs` | база |
| `CLICKHOUSE_USER` / `CLICKHOUSE_PASSWORD` | — | креды (см. этап 0) |
| `LOG_CH_MAX_BATCH` | `100` | размер батча |
| `LOG_CH_FLUSH_MS` | `5000` | интервал flush |
| `LOG_INGEST_RATE_LIMIT` | `60` | записей/мин с IP на `/api/logs` |

Имена и семантика совпадают с бэком (`back/docs/LOGGING.md`) — на сервере можно
использовать одни и те же значения.

## 6. Границы и риски

- **Схема `logs.app_logs` — контракт back-репо.** Фронт только INSERT. Любое
  изменение схемы — сначала PR в back.
- **Cardinality `app`:** имена приложений фиксированы (8 штук, `front-*`) —
  ничего динамического (userId, домен) в колонку `app` не класть, только в `meta`.
- **Браузерный ingest — публичный эндпоинт.** Валидация + потолок payload +
  rate-limit обязательны с первого коммита, не «потом». Никогда не логировать
  тело запроса как есть без truncate.
- **Секреты CH в браузер попасть не могут по построению** (server-only пакет,
  guard на `window`), но проверить бандл пилотного приложения:
  `grep -r CLICKHOUSE .next/static` → пусто.
- **Деплой фронта теперь требует живой сети бэка** (external network). Если это
  окажется болезненным — план-максимум из обсуждения: вынести clickhouse/grafana
  в отдельный infra-стек с собственной сетью, оба репо подключаются к ней. Не
  делаем сейчас, фиксируем как возможную эволюцию.
- **Часовой пояс:** timestamp пишем в UTC (как бэк). В Grafana время конвертирует
  datasource — не дублировать конверсию в приложении.

## 7. Definition of Done

1. Все 8 приложений пишут server-логи в `logs.app_logs` с `app='front-<name>'`.
2. Браузерные ошибки любого приложения доезжают через `/api/logs` с
   `meta.source='browser'` и rate-limit'ом.
3. Падение/недоступность ClickHouse не влияет на работу приложений (fail-open,
   память ограничена) — проверено на проде.
4. В Grafana есть дашборд по `app LIKE 'front-%'`.
5. Легаси (loki/promtail, файловые логи, `/api/admin/logs`) удалено.
6. `pnpm build` и деплой-workflow зелёные; изменения в back ограничены
   `name:` сети (+ опционально юзер CH и Grafana provisioning).
