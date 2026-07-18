# @workspace/nest-konstructor-api

Orval-клиент для бэкенда `back/apps/konstructor` (NestJS, defaultPort **3007**).

Во фронте admin отсюда берутся word/pdf-шаблоны (теги `Konstructor Word Template`,
`Konstructor Word Template Tags`, `Konstructor Offer Template` — `getKonstructor*`,
DTO `OfferTemplate*` / `WordTemplate*`).

## Генерация

Бэкенд должен быть запущен локально — orval читает живую OpenAPI-спеку:

```bash
# в back/
pnpm dev:konstructor          # поднимет http://localhost:3007 (swagger: /docs/api, json: /docs/api-json)

# в этом пакете
pnpm generate
```

После генерации обнови ручной баррель `src/generated/index.ts` — orval в режиме
`tags-split` не создаёт корневой index.

## Использование

Только внутри `lib/api/*-helper.ts` слайсов приложения (правило CLAUDE.md).
Base URL настраивается один раз в ApiProvider приложения:

```ts
import { configureBaseURL } from '@workspace/nest-konstructor-api';
configureBaseURL(process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL ?? 'http://localhost:3007/');
```

Prod URL — **TBD** (домен для konstructor-бэка ещё не заведён).
