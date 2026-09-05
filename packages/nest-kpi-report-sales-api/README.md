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

Без поднятого бэка (нет локальной БД): выгрузить спеку офлайн и передать файл —

```bash
# в back/ — DI-граф без init(): Prisma не коннектится, кроны не стартуют
npx ts-node -T -r tsconfig-paths/register scripts/dump-openapi.ts kpi-report-sales out.json
# в этом пакете
ORVAL_INPUT=/abs/path/out.json pnpm generate
```

Баррель `src/generated/index.ts` пересобирается скриптом после orval
(`scripts/build-generated-index.mjs`), руками его не трогать.

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
