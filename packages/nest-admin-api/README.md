# @workspace/nest-admin-api

Orval-клиент для бэкенда `back/apps/admin` (NestJS, defaultPort **3004**).

## Генерация

Бэкенд должен быть запущен локально — orval читает живую OpenAPI-спеку:

```bash
# в back/
pnpm dev:admin                # поднимет http://localhost:3004 (swagger: /docs/api, json: /docs/api-json)

# в этом пакете
pnpm generate
```

После генерации обнови ручной баррель `src/generated/index.ts` — orval в режиме
`tags-split` не создаёт корневой index.

## Использование

Только внутри `lib/api/*-helper.ts` слайсов приложения (правило CLAUDE.md).
Base URL настраивается один раз в ApiProvider приложения:

```ts
import { configureBaseURL } from '@workspace/nest-admin-api';
configureBaseURL(process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:3004/');
```

Prod URL — **TBD** (домен для admin-бэка ещё не заведён; по образцу
`api.install.april-app.ru` у pbx-install).
