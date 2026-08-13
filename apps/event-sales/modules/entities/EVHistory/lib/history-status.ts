import type { EVHistoryRecord } from '../model/history-record.type';

/**
 * Что стало с событием — кружком вместо строки текста.
 *
 * В ленте у каждой записи уже три бэйджа (тип, действие, результат), и
 * четвёртый текст её добивал. Статус же нужен именно мельком: пробегая
 * историю, менеджер ищет «состоялось / не состоялось», а не читает.
 */

export type HistoryStatusKind =
    | 'planned'
    | 'done'
    | 'overdue'
    | 'failed'
    | 'unknown';

export interface HistoryStatusView {
    kind: HistoryStatusKind;
    label: string;
    /** Цвет кружка — только токены тем. */
    color: string;
}

const STATUS_VIEW: Record<HistoryStatusKind, HistoryStatusView> = {
    planned: {
        kind: 'planned',
        label: 'Запланировано',
        color: 'var(--muted-foreground)',
    },
    done: { kind: 'done', label: 'Состоялось', color: 'var(--success)' },
    overdue: { kind: 'overdue', label: 'Просрочено', color: 'var(--warning)' },
    failed: {
        kind: 'failed',
        label: 'Не состоялось',
        color: 'var(--destructive)',
    },
    unknown: {
        kind: 'unknown',
        label: 'Статус не указан',
        color: 'var(--border)',
    },
};

/** Коды портала, по которым узнаём исход. Списки открытые — сверяем по вхождению. */
const DONE_CODES = ['done', 'result', 'success', 'complete', 'ok'];
const FAILED_CODES = ['fail', 'noresult', 'cancel', 'reject', 'not_done'];
const PLANNED_CODES = ['plan', 'wait', 'new'];

const matches = (value: string | undefined, codes: string[]): boolean =>
    Boolean(value && codes.some(code => value.includes(code)));

/** Сегодняшняя полночь: до неё запланированное считается просроченным. */
const isPast = (dateTs: number | null, now: number): boolean =>
    typeof dateTs === 'number' && dateTs > 0 && dateTs < now;

/**
 * Исход записи по кодам результата и действия, а при их отсутствии — по дате:
 * запланированное в прошлом считается просроченным, будущее — ожидающим.
 */
export const getHistoryStatus = (
    record: Pick<EVHistoryRecord, 'resultStatus' | 'eventAction' | 'dateTs'>,
    now: number,
): HistoryStatusView => {
    const result = record.resultStatus?.code?.toLowerCase();
    const action = record.eventAction?.code?.toLowerCase();

    if (matches(result, FAILED_CODES) || matches(action, FAILED_CODES)) {
        return STATUS_VIEW.failed;
    }
    if (matches(result, DONE_CODES) || matches(action, DONE_CODES)) {
        return STATUS_VIEW.done;
    }
    if (matches(result, PLANNED_CODES) || matches(action, PLANNED_CODES)) {
        return isPast(record.dateTs, now)
            ? STATUS_VIEW.overdue
            : STATUS_VIEW.planned;
    }
    return STATUS_VIEW.unknown;
};
