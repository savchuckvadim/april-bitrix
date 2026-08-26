import { format, isValid, parseISO } from 'date-fns';
import type { ZprCallView } from '../model';

/** Дата crm.item (ISO) → «27.08.2026 12:00»; мусор — null. */
export const formatZprDate = (value: string | null): string | null => {
    if (!value) return null;
    const date = parseISO(value);
    return isValid(date) ? format(date, 'dd.MM.yyyy HH:mm') : null;
};

/**
 * Строка-подпись элемента: открытый — когда запланирован, закрытый — когда
 * состоялся; спонтанный помечается словом. Данные отдельно от вёрстки.
 */
export const zprCallMeta = (view: ZprCallView): string | null => {
    const parts: string[] = [];
    if (view.call.isSpontaneous) parts.push('спонтанный');
    const planned = formatZprDate(view.call.planDate);
    const done = formatZprDate(view.call.doneDate);
    if (view.isClosed) {
        if (done) parts.push(done);
    } else if (planned) {
        parts.push(`на ${planned}`);
    }
    return parts.length ? parts.join(' · ') : null;
};

/** Сколько свежих записей ленты показываем в тултипе полоски. */
export const ZPR_TOOLTIP_COMMENTS_LIMIT = 3;
