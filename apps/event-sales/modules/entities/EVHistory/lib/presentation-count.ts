import type { EVHistoryRecord } from '../model/history-record.type';

/**
 * Сколько презентаций реально проведено по клиенту.
 *
 * Считаем по загруженной истории, а не отдельным запросом: ленты уже в
 * состоянии, и ещё один поход в портал ради одного числа не окупается.
 *
 * Считаем по УНИКАЛЬНЫМ записям. Одно событие пишет ОДИН элемент списка с
 * несколькими crm-привязками (компания + сделка + лид), и лента приходит
 * отдельно на каждую привязку — сложение длин дало бы одну презентацию за
 * три. Записи в состоянии лежат словарём по id, так что дедуп уже случился;
 * функция чистая, чтобы это можно было закрепить тестом.
 *
 * Портальное поле `pres_count` для этого не годится: на новой презентационной
 * сделке оно обнуляется и по связям клиента не агрегирует.
 */

/** Коды портала: тип события «презентация» и действие «проведена». */
const PRESENTATION_TYPE_CODE = 'presentation';
const DONE_ACTION_CODES = ['done', 'result', 'success'];

const isDone = (code: string | undefined): boolean =>
    Boolean(code && DONE_ACTION_CODES.some(done => code.includes(done)));

export const countDonePresentations = (records: EVHistoryRecord[]): number => {
    const seen = new Set<number>();

    for (const record of records) {
        if (record.eventType?.code !== PRESENTATION_TYPE_CODE) continue;
        if (!isDone(record.eventAction?.code?.toLowerCase())) continue;
        seen.add(record.id);
    }

    return seen.size;
};
