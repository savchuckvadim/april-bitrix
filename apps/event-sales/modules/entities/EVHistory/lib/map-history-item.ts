import type { IBXListItem } from '@workspace/bitrix';
import {
    EVHistoryRecord,
    HistoryEnumValue,
} from '../model/history-record.type';
import { HistoryFieldRef, HistoryListRef } from './history-list';

/**
 * Обратный маппинг элемента списка `PROPERTY_* → домен` (порт паттерна
 * `prepareResponse` из back kpi-report-sales/sales-user-report.service).
 *
 * Значения свойств Битрикс отдаёт мапами `{ '123': значение }` — и для
 * одиночных тоже; enum-значение — это `bitrixId` варианта, который резолвится
 * в `{code, name}` по items поля из слепка портала.
 *
 * EXTENSION POINT: op_smart_* поля (smart-процессы не внедрены) в маппер
 * сознательно не включены — появятся вместе с флоу заявок.
 */

const rawValues = (element: IBXListItem, ref?: HistoryFieldRef): unknown[] => {
    if (!ref) return [];
    const raw = element[ref.key as `PROPERTY_${string}`];
    if (raw === null || raw === undefined) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [raw];
};

const readScalar = (element: IBXListItem, ref?: HistoryFieldRef): string => {
    const first = rawValues(element, ref)[0];
    return first === null || first === undefined ? '' : String(first);
};

const readEnum = (
    element: IBXListItem,
    ref?: HistoryFieldRef,
): HistoryEnumValue | null => {
    const raw = readScalar(element, ref);
    if (!raw) return null;
    const item = ref?.items.find(
        candidate => Number(candidate.bitrixId) === Number(raw),
    );
    // Итем не нашёлся (поле пере-инсталлено и т.п.) — честно показываем сырое
    // значение, а не прячем запись.
    return item
        ? { code: item.code, name: item.name || item.title || item.code }
        : { code: raw, name: raw };
};

const readNumber = (
    element: IBXListItem,
    ref?: HistoryFieldRef,
): number | null => {
    const value = Number(readScalar(element, ref));
    return Number.isFinite(value) && value > 0 ? value : null;
};

/** Все привязки записи из множественного поля `crm` (CO_431, D_5512, ...). */
const readBindings = (
    element: IBXListItem,
    ref?: HistoryFieldRef,
): string[] => [
    ...new Set(
        rawValues(element, ref)
            .map(value => String(value ?? '').trim().toUpperCase())
            .filter(Boolean),
    ),
];

/** `DD.MM.YYYY HH:mm:ss` портала → timestamp; не распарсилось — null. */
export const parseCrmDate = (raw: string): number | null => {
    const match = raw.match(
        /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/,
    );
    if (!match) {
        const fallback = Date.parse(raw);
        return Number.isFinite(fallback) ? fallback : null;
    }
    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] =
        match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
    ).getTime();
};

export const mapHistoryElement = (
    element: IBXListItem,
    ref: HistoryListRef,
): EVHistoryRecord => {
    const date =
        readScalar(element, ref.properties.eventDate) ||
        String(element.DATE_CREATE ?? '');

    return {
        id: Number(element.ID ?? 0),
        title:
            readScalar(element, ref.properties.eventTitle) ||
            String(element.NAME ?? ''),
        comment: readScalar(element, ref.properties.comment),
        date,
        dateTs: date ? parseCrmDate(date) : null,
        responsibleId: readNumber(element, ref.properties.responsible),
        eventType: readEnum(element, ref.properties.eventType),
        eventAction: readEnum(element, ref.properties.eventAction),
        resultStatus: readEnum(element, ref.properties.resultStatus),
        bindings: readBindings(element, ref.properties.crm),
    };
};
