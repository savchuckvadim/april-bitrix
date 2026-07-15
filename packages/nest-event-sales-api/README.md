# @workspace/nest-event-sales-api

Orval-клиент для бэкенда `back/apps/event-sales` (NestJS, defaultPort **3005**).

## Генерация

Бэкенд должен быть запущен локально — orval читает живую OpenAPI-спеку:

```bash
# в back/
pnpm dev:event-sales          # поднимет http://localhost:3005 (swagger: /docs/api, json: /docs/api-json)

# в этом пакете
pnpm generate
```

После генерации обнови ручной баррель `src/generated/index.ts` — orval в режиме
`tags-split` не создаёт корневой index (см. комментарии в файле).

## Использование

Только внутри `lib/api/*-helper.ts` слайсов приложения (правило CLAUDE.md).
Base URL настраивается один раз в ApiProvider приложения:

```ts
import { configureBaseURL } from '@workspace/nest-event-sales-api';
configureBaseURL(process.env.NEXT_PUBLIC_EVENT_SALES_API_URL ?? 'http://localhost:3005/');
```

Prod URL — **TBD** (домен для event-sales-бэка ещё не заведён; по образцу
`api.install.april-app.ru` у pbx-install).

Карта legacy PHP → новые эндпоинты и статусы заглушек:
`back/apps/event-sales/docs/legacy-endpoint-gap.md`.
