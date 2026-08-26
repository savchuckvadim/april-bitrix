import {
    findFieldItemByBitrixId,
    findPortalField,
    findUfKey,
    type PBXField,
    type Portal,
} from '@workspace/pbx';
import {
    toDateInputValue,
    toDateTimeInputValue,
    toHumanDate,
    toHumanDateTime,
} from '@/modules/shared/lib/crm-date';
import type { ChecklistFieldDef } from '../type/call-checklist.type';

/**
 * Резолв поля чек-листа в конкретного носителя и чтение текущего значения.
 *
 * Носитель — по приоритету ИНН (как PurchaseSignals): компания → сделка →
 * лид; берётся ПЕРВАЯ сущность, где поле установлено на портале и строка
 * загружена. Так один каталог кроет и поля компании (op_efield_fail_reason
 * пишется в сущность-владельца), и чисто сделочные поля конструктора
 * (op_invoice_date есть только на deal — компания его просто не отдаст ключа).
 *
 * Ничего не резолвится (лид-only без поля, слепок без поля) — поле не
 * показывается и отправку не блокирует: самогейт, никакого релиза под
 * установку поля не нужно.
 */

export type ChecklistEntityKind = 'company' | 'deal' | 'lead';

export interface ChecklistEntityRows {
    company: Record<string, unknown> | null;
    deal: Record<string, unknown> | null;
    lead: Record<string, unknown> | null;
}

export interface ResolvedChecklistField {
    def: ChecklistFieldDef;
    entity: ChecklistEntityKind;
    entityId: number;
    ufKey: string;
    /** null — штатное поле Bitrix (native), слепок не участвует. */
    field: PBXField | null;
    /** Нормализованное значение для контрола ('' — пусто). */
    currentValue: string;
    /** Человекочитаемое значение (имя item'а, дата) для подписи «сейчас». */
    currentLabel: string;
}

/**
 * Значение контрола по типу поля: `date` — `YYYY-MM-DD`, `datetime` —
 * `YYYY-MM-DDTHH:mm` (контрол `datetime-local`). Разбор обоих диалектов
 * портала — в общем нормализаторе (`modules/shared/lib/crm-date`).
 *
 * До этого datetime-поля («Дата последнего счёта», «Направлено КП») читались
 * и показывались как чистая дата: время из портала терялось молча, а обратная
 * запись обнуляла его.
 */
export const toChecklistInputValue = (
    type: ChecklistFieldDef['type'],
    raw: unknown,
): string =>
    type === 'datetime' ? toDateTimeInputValue(raw) : toDateInputValue(raw);

/** Подпись «сейчас: …» — дата или дата со временем, в локали портала. */
export const toChecklistDisplayValue = (
    type: ChecklistFieldDef['type'],
    raw: unknown,
): string => (type === 'datetime' ? toHumanDateTime(raw) : toHumanDate(raw));

const fieldsFor = (
    portal: Portal | null | undefined,
    kind: ChecklistEntityKind,
): PBXField[] | null | undefined => {
    if (!portal) return null;
    if (kind === 'company') return portal.company?.bitrixfields;
    // Историческое имя узла сделки в слепке — bitrixDeal.
    if (kind === 'deal') return portal.bitrixDeal?.bitrixfields;
    return portal.lead?.bitrixfields;
};

const ENTITY_PRIORITY: ChecklistEntityKind[] = ['company', 'deal', 'lead'];

/** Сумма Bitrix ('150000.00'): нули и мусор считаются «пусто». */
const toMoneyValue = (raw: unknown): string => {
    const value = Number(String(raw ?? '').replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? String(value) : '';
};

export const resolveChecklistField = (
    def: ChecklistFieldDef,
    portal: Portal | null | undefined,
    rows: ChecklistEntityRows,
): ResolvedChecklistField | null => {
    // dto-поля (продажа) уезжают в payload отправки, а не в CRM: строка
    // сущности нужна только для подписи «сейчас» — её отсутствие (сделку
    // создаст сам flow) не прячет поле, иначе обязательность молча
    // испарялась бы, а сервер-гард всё равно вернул бы 400.
    const isDtoChannel = def.channel === 'dto';

    // Штатное поле Bitrix (OPPORTUNITY): живёт только на сделке, ключ —
    // сам код, слепок портала не нужен.
    if (def.native) {
        const row = rows.deal;
        const entityId = Number(row?.['ID']);
        const hasRow = Boolean(
            row && Number.isFinite(entityId) && entityId > 0,
        );
        if (!hasRow && !isDtoChannel) return null;
        const currentValue = hasRow ? toMoneyValue(row?.[def.code]) : '';
        return {
            def,
            entity: 'deal',
            entityId: hasRow ? entityId : 0,
            ufKey: def.code,
            field: null,
            currentValue,
            currentLabel: currentValue
                ? `${Number(currentValue).toLocaleString('ru-RU')} ₽`
                : '',
        };
    }

    for (const kind of ENTITY_PRIORITY) {
        const row = rows[kind];
        if (!row && !isDtoChannel) continue;
        const fields = fieldsFor(portal, kind);
        const field = findPortalField(fields, def.code);
        const ufKey = findUfKey(fields, def.code);
        const entityId = Number(row?.['ID']);
        const hasRow = Boolean(
            row && Number.isFinite(entityId) && entityId > 0,
        );
        if (!field || !ufKey || (!hasRow && !isDtoChannel)) {
            continue;
        }

        const raw = hasRow ? row?.[ufKey] : undefined;
        let currentValue = '';
        let currentLabel = '';
        if (def.type === 'enumeration') {
            const item =
                raw === null || raw === undefined || raw === ''
                    ? null
                    : findFieldItemByBitrixId(field, String(raw));
            currentValue = item?.code ?? '';
            currentLabel = item?.name ?? '';
        } else if (def.type === 'date' || def.type === 'datetime') {
            currentValue = toChecklistInputValue(def.type, raw);
            currentLabel = toChecklistDisplayValue(def.type, raw);
        } else {
            currentValue = typeof raw === 'string' ? raw : String(raw ?? '');
            currentLabel = currentValue;
        }

        return {
            def,
            entity: kind,
            entityId: hasRow ? entityId : 0,
            ufKey,
            field,
            currentValue,
            currentLabel,
        };
    }
    return null;
};

/** Items enum-поля без дублей кодов (в реестре встречаются задвоения). */
export const checklistEnumItems = (
    field: PBXField,
): Array<{ code: string; name: string }> => {
    const seen = new Set<string>();
    const items: Array<{ code: string; name: string }> = [];
    for (const item of field.items ?? []) {
        if (!item.code || seen.has(item.code)) continue;
        seen.add(item.code);
        items.push({ code: item.code, name: item.name });
    }
    return items;
};
