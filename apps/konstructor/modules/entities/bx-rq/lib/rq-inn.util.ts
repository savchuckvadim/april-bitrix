import { RQ_ITEM_CODE, type RqRecord } from '../model/types';

/**
 * ИНН сохранённого реквизита (поле `inn`). Шаблон (bx_id -1) реквизитом ещё
 * не является: его ИНН пуст, а черновик живёт отдельно, в `creating`.
 */
export const getRqInn = (rq: RqRecord | null | undefined): string | null => {
    if (!rq || rq.bx_id <= 0) return null;
    const field = (rq.fields ?? []).find(item => item.code === RQ_ITEM_CODE.INN);
    if (!field || field.type === 'select' || field.type === 'file') return null;
    const value = typeof field.value === 'string' ? field.value.trim() : '';
    return value || null;
};
