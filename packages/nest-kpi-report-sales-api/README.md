# @workspace/nest-kpi-report-sales-api

Orval-клиент для бэкенда `back/apps/kpi-report-sales` (NestJS, локальный порт **3000**,
задаётся PORT в `back/apps/kpi-report-sales/.env`).

## Генерация

Бэкенд должен быть запущен локально — orval читает живую OpenAPI-спеку:

```bash
# в back/ (зависимости там ставятся через npm)
npm run dev:kpi-report-sales  # поднимет http://localhost:3000 (swagger: /docs/api, json: /docs/api-json)

# в этом пакете
pnpm generate
```

После генерации обнови ручной баррель `src/generated/index.ts` — orval в режиме
`tags-split` не создаёт корневой index (см. комментарии в файле).

## Использование

Только внутри `lib/api/*-helper.ts` слайсов приложения (правило CLAUDE.md).
Base URL настраивается один раз в ApiProvider приложения:

```ts
import { configureBaseURL } from '@workspace/nest-kpi-report-sales-api';
configureBaseURL(process.env.NEXT_PUBLIC_KPI_REPORT_SALES_API_URL ?? 'http://localhost:3000/');
```

Prod URL — `https://api.kpi-sales.april-app.ru` (host-порт 8223, см.
`back/infra/compose/ports.env`).

Клиенты: `getSalesReport()` (KPI-отчёт + персональный отчёт менеджера),
`getKpiSalesReportDownload()` (Excel), `getBitrixDomainDepartment()` /
`getBitrixDomainTeam()` (отделы и команды Bitrix из BxDepartmentModule).
