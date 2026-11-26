import { BXUser } from "@workspace/bx";
import type { CallingBucketId } from '@/modules/shared/lib/indicator-labels';

export interface ReportCallingData {
    userId: number;
    userName?: string;
    callings: Array<KPICall>;
    user: BXUser;
}

export type KPICall = {
    id: CALL_DURATION;
    action: CALL_DURATION_NAME;
    count: number;
    // list?: KPIListItem[]
};
enum CALL_DURATION {
    ALL = 'all',
    HALF = 30,
    MINUTE = 60,
    THREE_MINUTE = 180,
    FIVE_MINUTE = 300,
    PRESENTATION = 600,
}

/**
 * Бакеты в ключах своих названий (`call:<id>`) — CALLING_BUCKET_IDS в
 * shared/lib/indicator-labels. Набор обязан совпадать с CALL_DURATION:
 * новый бакет без записи там (или лишняя запись) — ошибка компиляции.
 */
type CallingBucketIdsMatch = [`${CALL_DURATION}`] extends [CallingBucketId]
    ? [CallingBucketId] extends [`${CALL_DURATION}`]
        ? true
        : false
    : false;
export const CALLING_BUCKET_IDS_MATCH: CallingBucketIdsMatch = true;

enum CALL_DURATION_NAME {
    ALL = 'Наборов номера',
    HALF = 'Звонки > 30 сек',
    MINUTE = 'Звонки > минуты',
    THREE_MINUTE = 'Звонки > 3 минут',
    FIVE_MINUTE = 'Звонки > 5 минут',
    PRESENTATION = 'Звонки > 10 минут',
}
