/**
 * Почасовые корзины дня: события (стек по исходу), план на день (по часу
 * дедлайна), звонки и эфир (из корзин бэка). Чистые функции.
 */
import type { DigestCalls, DigestEmployee, DigestRecord } from '../model';
import { DIGEST_CALL_TYPE_CODES, DigestStackKey } from './digest-catalog';
import { hourOfDateTime } from './digest-period.util';

export const HOURS_IN_DAY = 24;

export interface HourBucket {
    hour: number;
    values: Record<string, number>;
}

const emptyBuckets = (): HourBucket[] =>
    Array.from({ length: HOURS_IN_DAY }, (_, hour) => ({ hour, values: {} }));

const bump = (bucket: HourBucket, key: string, value = 1): void => {
    bucket.values[key] = (bucket.values[key] ?? 0) + value;
};

const DOCUMENT_TYPES = new Set([
    'ev_offer',
    'ev_offer_pres',
    'ev_invoice',
    'ev_invoice_pres',
    'ev_contract',
    'ev_supply',
]);

/** Стек графика событий по записи (null — запись не рисуется). */
export const stackOfRecord = (record: DigestRecord): DigestStackKey | null => {
    const type = record.typeCode ?? '';
    const action = record.actionCode;
    if (type === 'ev_success') return action === 'done' ? 'sales' : null;
    if (type === 'ev_fail') return action === 'done' ? 'refusals' : null;
    if (DOCUMENT_TYPES.has(type)) return action === 'act_send' ? 'documents' : null;
    switch (action) {
        case 'done':
            return 'done';
        case 'act_noresult_fail':
            return 'notHeld';
        case 'pound':
            return 'postponed';
        case 'plan':
            return 'planned';
        default:
            return null;
    }
};

/** События дня по часу записи, стек — исход. */
export const bucketRecordsByHour = (records: readonly DigestRecord[]): HourBucket[] => {
    const buckets = emptyBuckets();
    for (const record of records) {
        const hour = hourOfDateTime(record.eventDate);
        const stack = stackOfRecord(record);
        const bucket = hour === null ? undefined : buckets[hour];
        if (!bucket || !stack) continue;
        bump(bucket, stack);
    }
    return buckets;
};

/** Запланированное на день по часу дедлайна, стек — группа типа (звонки/презентации/прочее). */
export const bucketPlannedByHour = (records: readonly DigestRecord[]): HourBucket[] => {
    const buckets = emptyBuckets();
    for (const record of records) {
        const hour = hourOfDateTime(record.planDate);
        const bucket = hour === null ? undefined : buckets[hour];
        if (!bucket) continue;
        bump(bucket, plannedStackOf(record.typeCode));
    }
    return buckets;
};

export type PlannedStackKey = 'calls' | 'presentations' | 'other';

export const plannedStackOf = (typeCode: string | null): PlannedStackKey => {
    if (typeCode && DIGEST_CALL_TYPE_CODES.includes(typeCode)) return 'calls';
    if (typeCode === 'presentation') return 'presentations';
    return 'other';
};

/** Звонки и эфир по часам (минуты) — сумма по сотрудникам. */
export const bucketCallsByHour = (calls: readonly (DigestCalls | null)[]): HourBucket[] => {
    const buckets = emptyBuckets();
    for (const cell of calls) {
        if (!cell) continue;
        for (const hour of cell.byHour) {
            const bucket = buckets[hour.hour];
            if (!bucket) continue;
            bump(bucket, 'calls', hour.calls);
            bump(bucket, 'minutes', hour.seconds / 60);
        }
    }
    for (const bucket of buckets) {
        if (bucket.values.minutes !== undefined) {
            bucket.values.minutes = Math.round(bucket.values.minutes * 10) / 10;
        }
    }
    return buckets;
};

export interface HourRange {
    from: number;
    to: number;
}

/** Рабочий диапазон 8–20, расширенный до часов с данными. */
export const visibleHourRange = (
    bucketSets: readonly (readonly HourBucket[])[],
    base: HourRange = { from: 8, to: 20 },
): HourRange => {
    let from = base.from;
    let to = base.to;
    for (const buckets of bucketSets) {
        for (const bucket of buckets) {
            const hasData = Object.values(bucket.values).some(value => value > 0);
            if (!hasData) continue;
            from = Math.min(from, bucket.hour);
            to = Math.max(to, bucket.hour);
        }
    }
    return { from, to };
};

export const hourLabel = (hour: number): string => `${String(hour).padStart(2, '0')}:00`;

/** Записи выбранных сотрудников (все — при пустом фокусе). */
export const recordsOfEmployees = (
    employees: readonly DigestEmployee[],
    focusUserId: number | null,
    key: 'records' | 'plannedAtStartRecords',
): DigestRecord[] =>
    employees
        .filter(employee => focusUserId === null || employee.userId === focusUserId)
        .flatMap(employee => employee[key]);
