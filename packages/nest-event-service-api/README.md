# @workspace/nest-event-service-api

Orval-клиент для бэкенда `back/apps/event-service` (NestJS, defaultPort **3006**).

Пакет заведён под портальную поверхность СКАП (`/api/event-service/skap/run|status`).
Ручные parse-ручки СКАП исторически лежат в `@workspace/nest-api` — это
замороженный снапшот разобранного монолита (:3000 теперь пустой `back`),
его не перегенерировать; новые ручки event-service подключаем отсюда.

## Генерация

Бэкенд должен быть запущен локально — orval читает живую OpenAPI-спеку:

```bash
# в back/
pnpm dev:event-service        # поднимет http://localhost:3006 (swagger: /docs/api, json: /docs/api-json)

# в этом пакете
pnpm generate
```

Офлайн-вариант без поднятого бэка — `orval.offline.config.ts` (схему снимает
`back/scripts/dump-openapi.ts event-service event-service-openapi.json`).

После генерации обнови ручной баррель `src/generated/index.ts` — orval в режиме
`tags-split` не создаёт корневой index (см. комментарии в файле).

## Использование

Только внутри `lib/api/*-helper.ts` слайсов приложения (правило CLAUDE.md).
Base URL настраивается один раз в ApiProvider приложения:

```ts
import { configureBaseURL } from '@workspace/nest-event-service-api';
configureBaseURL(process.env.NEXT_PUBLIC_EVENT_SERVICE_API_URL ?? 'http://localhost:3006/');
```

Prod URL — **TBD** (домен для event-service-бэка ещё не заведён; по образцу
остальных сервисов будет `https://api.event-service.april-app.ru/`).
