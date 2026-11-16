/**
 * Ответ кнопки «Сформировать и отправить» аудита сделок
 * (POST /api/admin/portal/:portalId/deal-audit/run-now). Описан руками,
 * пока ручка не попала в `@workspace/nest-admin-api` (`pnpm run generate`):
 * после генерации меняются только этот алиас и helper.
 */
export interface DealAuditRunNowResponse {
    /** false — прогон портала уже идёт или ждёт очереди, второй не поставлен. */
    queued: boolean;
    domain: string;
    /** Что произойдёт дальше — показывается как есть. */
    message: string;
    /** Предупреждения по настройкам: аудит выключен, «только считать», нет получателей. */
    notes: string[];
}
