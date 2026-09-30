import type { AiRopMarkSaveResult } from './index';

/*
 * Под-состояние сохранения слепой метки (rop-mark/save) слайса aiAnalytics:
 * тип и пустое значение (сами case-редьюсеры — в слайсе).
 */

/** Сохранение слепой метки (rop-mark/save); список недели остаётся на экране. */
export interface AiRopMarkSaveState {
    /** transcriptionId звонка, метка по которому отправляется; null — нет. */
    pending: string | null;
    /** Текст 400/403 сервера или сети; сбрасывается новой отправкой. */
    error: string | null;
    /** Результат последней записи (id, replaced, blind). */
    lastSaved: AiRopMarkSaveResult | null;
}

export const emptyRopMarkSave = (): AiRopMarkSaveState => ({
    pending: null,
    error: null,
    lastSaved: null,
});
