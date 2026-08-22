import type { RootState } from '@/modules/app/model/store';

/**
 * Можно ли отправить отчёт БЕЗ плана следующего события.
 *
 * Правило владельца (18.08.2026, фича из оригинальной версии): когда у клиента
 * уже больше одной живой задачи, следующий шаг и так назначен — заставлять
 * планировать ещё один значит плодить дубли. Плюс прежний путь: домены с
 * `withNoPlan` разрешают пропуск всегда.
 *
 * База счёта — список дел клиента (`state.eventTask.tasks`), тот же, что
 * видит менеджер в списке: текущая задача + хотя бы одна другая.
 */
export const getCanSkipPlan = (state: RootState): boolean => {
    if (state.app.config.withNoPlan) return true;
    return (state.eventTask.tasks?.length ?? 0) > 1;
};
