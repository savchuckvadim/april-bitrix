export * from './model/PresSlice';

/**
 * TODO(бэк): счётчики презентаций по задачам — legacy PHP `POST pres/count`
 * ({domain, currentTask} → {counts: {company, smart, deal}, deal}); эндпоинта
 * на новом бэке нет — добавить в event-support и подключить thunk
 * getInitPresentation (см. gap-док).
 */
