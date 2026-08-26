import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import type { ZprRef } from '../model';

/** Код pbx-поля обратных ссылок (реестр event: установлен на сделке и компании). */
export const ZPR_REFS_FIELD_CODE = PBX_SALES_EVENT_FIELD_CODES.op_zprs;

/**
 * Разбор обратных ссылок op_zprs: `T{hex(entityTypeId)}_{elementId}`.
 *
 * Формат пишет бэк (zpr-flow.service: `T${entityTypeId.toString(16)}_${id}`,
 * пример `T40e_501` → entityTypeId 1038, элемент 501). В том же multiple
 * crm-поле теоретически могут оказаться и обычные привязки (`D_5`, `CO_7`) —
 * всё, что не динамический тип, молча отбрасываем: слайс ЗПР читает только
 * элементы смартов.
 */

/** `T` + hex entityTypeId + `_` + десятичный id элемента. Регистр — любой. */
const ZPR_REF_PATTERN = /^T([0-9a-f]+)_(\d+)$/i;

/** Одно значение поля → ссылка; мусор и чужие привязки → null. */
export const parseZprRef = (raw: unknown): ZprRef | null => {
    if (typeof raw !== 'string' && typeof raw !== 'number') return null;
    const match = ZPR_REF_PATTERN.exec(String(raw).trim());
    if (!match) return null;
    const entityTypeId = Number.parseInt(match[1]!, 16);
    const elementId = Number(match[2]);
    if (!Number.isFinite(entityTypeId) || entityTypeId <= 0) return null;
    if (!Number.isFinite(elementId) || elementId <= 0) return null;
    return { entityTypeId, elementId };
};

/** Ключ дедупликации ссылки. */
export const zprRefKey = (ref: ZprRef): string =>
    `${ref.entityTypeId}:${ref.elementId}`;

/**
 * Сырое значение multiple crm-поля (массив/строка/что угодно) → уникальные
 * ссылки. Не-массив трактуем как одиночное значение: Битрикс так отдаёт
 * поле, у которого multiple слетел при установке.
 */
export const parseZprRefs = (raw: unknown): ZprRef[] => {
    const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
    const seen = new Set<string>();
    const refs: ZprRef[] = [];
    for (const value of values) {
        const ref = parseZprRef(value);
        if (!ref) continue;
        const key = zprRefKey(ref);
        if (seen.has(key)) continue;
        seen.add(key);
        refs.push(ref);
    }
    return refs;
};

/** Объединение ссылок из нескольких источников (сделка + компания) без дублей. */
export const mergeZprRefs = (...groups: ZprRef[][]): ZprRef[] => {
    const seen = new Set<string>();
    const refs: ZprRef[] = [];
    for (const group of groups) {
        for (const ref of group) {
            const key = zprRefKey(ref);
            if (seen.has(key)) continue;
            seen.add(key);
            refs.push(ref);
        }
    }
    return refs;
};

/**
 * Стабильный ключ набора ссылок — для queryKey: одинаковый набор в любом
 * порядке не перезапрашивает элементы.
 */
export const zprRefsKey = (refs: ZprRef[]): string =>
    refs
        .map(zprRefKey)
        .sort()
        .join(',');
