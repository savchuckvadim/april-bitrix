// Hand-maintained barrel of generated tag clients (orval `tags-split` does not
// emit a root index). Add new tag re-exports here as endpoints are wired up on
// the frontend. Schemas are re-exported separately via ./model.

// СКАП: run («Обновить из хранилища») + status (индикатор, folderUrl, smartUrl)
// + ручные parse-ручки (zip/csv/xlsx) и шаблон-пример
export * from './event-service-skap/event-service-skap';
export * from './model';

// Доступны после generate, подключать по мере необходимости:
// export * from './event-service/event-service';
// export * from './event-service-calling/event-service-calling';
// export * from './event-servicedealact/event-servicedealact';
// export * from './front-portal/front-portal';
// export * from './health/health';
// export * from './metrics/metrics';
