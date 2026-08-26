/**
 * Решение фонового onDone отправки: можно ли чистить форму (cleanEvent).
 *
 * Очередь на бэке работает долго, и к моменту done менеджер мог уже открыть
 * ДРУГОЕ дело и заполнять новый отчёт — cleanEvent тогда стирал его работу.
 * Форму чистим только когда она всё ещё принадлежит ОТПРАВЛЕННОМУ отчёту.
 *
 * Что чистит cleanEvent, делится на две части:
 * - «форма текущего отчёта» (current задача/контакт, report/plan/presentation,
 *   черновик комментария, меню) — её и защищает это решение;
 * - «процессные флаги» отправки (afterPresentation, presentationLeadLink,
 *   taskLeadLinks, callChecklist, stagePredict) — их при пропуске cleanEvent
 *   всё равно сбросит reloadApp (каталог reload-reset), кроме ТМЦ-меню:
 *   его SendThunk гасит отдельно.
 */
export interface CleanAfterSendInput {
    /** Менеджер ещё на экране финиша (event.isFinish). */
    isFinishOpen: boolean;
    /** id задачи, по которой ушёл отчёт (null — отчёт без задачи, меню NEW). */
    sentTaskId: number | string | null;
    /** id текущей задачи на момент done. */
    currentTaskId: number | string | null;
    /** Меню результата открыто (eventItem.isActive). */
    isItemMenuOpen: boolean;
}

const isSameTask = (
    a: number | string | null,
    b: number | string | null,
): boolean => {
    if (a == null || b == null) return a == null && b == null;
    return Number(a) === Number(b);
};

export const shouldCleanAfterSend = ({
    isFinishOpen,
    sentTaskId,
    currentTaskId,
    isItemMenuOpen,
}: CleanAfterSendInput): boolean => {
    // На экране финиша форма гарантированно принадлежит отправленному отчёту.
    if (isFinishOpen) return true;
    // Открыта карточка другой задачи (или NEW без задачи после отчёта по
    // задаче, и наоборот) — там уже заполняют новый отчёт, форму не трогаем.
    if (!isSameTask(currentTaskId, sentTaskId)) return false;
    // Отчёт шёл без задачи (меню NEW), и меню снова открыто: по «той же»
    // null-задаче не отличить «остатки отправленного» от «заполняют заново» —
    // безопаснее не чистить (остатки уберёт cleanEvent следующей отправки).
    if (currentTaskId == null && isItemMenuOpen) return false;
    return true;
};
