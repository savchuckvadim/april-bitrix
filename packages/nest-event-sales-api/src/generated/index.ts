// Hand-maintained barrel of generated tag clients (orval `tags-split` does not
// emit a root index). Add new tag re-exports here as endpoints are wired up on
// the frontend. Schemas are re-exported separately via ./model.

// Основной flow (POST /api/event-sales/flow)
export * from './event-sales/event-sales';
// Поддерживающие эндпоинты: deals, new-task/init, pres/tmc-deals, history, result/count
export * from './event-sales-support/event-sales-support';
// Отдел продаж портала (POST /api/bitrix/department/sales и др.)
export * from './bitrix-domain-department/bitrix-domain-department';
// Записи звонков по компании (POST /api/event-sales-bx-records/company)
export * from './event-sales-bx-records/event-sales-bx-records';

// Доступны после generate, подключать по мере необходимости:
// export * from './bitrix-domain-team/bitrix-domain-team';
// export * from './event-sales-cold-hook/event-sales-cold-hook';
// export * from './event-sales-lead-hook/event-sales-lead-hook';
// export * from './health/health';
// export * from './metrics/metrics';
// export * from './telegram/telegram';
