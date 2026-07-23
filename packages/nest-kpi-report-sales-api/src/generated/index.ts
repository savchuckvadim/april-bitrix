// Hand-maintained barrel of generated tag clients (orval `tags-split` does not
// emit a root index). Add new tag re-exports here as endpoints are wired up on
// the frontend. Schemas are re-exported separately via ./model.

// KPI-отчёт отдела продаж + персональный отчёт менеджера
// (POST /api/kpi-report/get, /api/kpi-report/calling-statistic, /api/sales-user-report*)
export * from './sales-report/sales-report';
// Скачивание Excel-отчёта (POST /api/kpi-report/download)
export * from './kpi-sales-report-download/kpi-sales-report-download';
// Отделы Bitrix (POST /api/bx/department, /api/bitrix/department/sales, /api/bx/department/structure)
export * from './bitrix-domain-department/bitrix-domain-department';
// Команды Bitrix (POST /api/bx/team)
export * from './bitrix-domain-team/bitrix-domain-team';
// Сохранённые фильтры отчёта (POST /api/kpi-report/filter/get, /api/kpi-report/filter/save)
export * from './sales-report-filter/sales-report-filter';

// Доступны после generate, подключать по мере необходимости:
// export * from './front-portal/front-portal';
// export * from './health/health';
// export * from './metrics/metrics';
// export * from './telegram/telegram';
