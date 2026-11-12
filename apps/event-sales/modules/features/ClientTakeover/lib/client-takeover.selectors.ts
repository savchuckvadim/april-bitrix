import type { RootState } from '@/modules/app/model/store';

/**
 * Нужно спросить «Забрать работу коллег себе?» перед отправкой: на портале
 * включены перехват всей работы и подтверждение, а вопрос по этому отчёту
 * ещё не закрыт. Есть ли чужая работа — выясняет open-thunk у бэка.
 */
export const selectNeedClientTakeover = (state: RootState): boolean =>
    state.app.config.reportTakeoverForce &&
    state.app.config.reportTakeoverConfirm &&
    !state.clientTakeover.resolved;

/** Предпросмотр уже запрошен — повторное «Отправить» ждёт его, а не шлёт второй. */
export const selectClientTakeoverLoading = (state: RootState): boolean =>
    state.clientTakeover.status === 'loading' && !state.clientTakeover.resolved;
