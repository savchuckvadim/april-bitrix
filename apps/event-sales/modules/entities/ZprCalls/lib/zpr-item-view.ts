import type { ZprCall } from '../model';

/**
 * Чтение полей элемента ЗПР из ответа crm.item.
 *
 * UF-имя поля смарта — `UF_CRM_{typeId}_{CODE}` (бэк-реестр pbx-zpr-smart),
 * а crm.item отдаёт его camel-ключом `ufCrm{typeId}{Code}`. `typeId` — id
 * смарт-ТИПА (crm.type), у фронта его нет: из ссылок op_zprs известен только
 * entityTypeId. Поэтому ключ ищем по самому элементу: нормализованный ключ
 * обязан быть `ufcrm` + цифры typeId + нормализованный код. Формула camel не
 * всегда сходится с реальностью (боевой инцидент UF_CRM_94_TRANSCRIPT_1 у
 * skap) — матч по фактическим ключам элемента этим не задет: не нашли ключ —
 * поле честно пустое (fail-open).
 */

/** Коды полей смарта, которые читает фронт (бэк-реестр ZPR_SMART_FIELDS). */
export const ZPR_FIELD_CODES = {
    PLAN_DATE: 'ZPR_PLAN_DATE',
    DONE_DATE: 'ZPR_DONE_DATE',
    IS_SPONTANEOUS: 'ZPR_IS_SPONTANEOUS',
    PLAN_COMMENT: 'ZPR_PLAN_COMMENT',
    REPORT_COMMENT: 'ZPR_REPORT_COMMENT',
    COMMENTS: 'ZPR_COMMENTS',
} as const;

type ZprFieldCode = (typeof ZPR_FIELD_CODES)[keyof typeof ZPR_FIELD_CODES];

/** `UF_CRM_45_ZPR_PLAN_DATE` и `ufCrm45ZprPlanDate` → `ufcrm45zprplandate`. */
const normalizeKey = (value: string): string =>
    value.replace(/[^0-9a-z]/gi, '').toLowerCase();

/** Фактический ключ поля по коду; нет такого ключа у элемента — null. */
export const findZprItemKey = (
    item: Record<string, unknown>,
    code: ZprFieldCode,
): string | null => {
    const pattern = new RegExp(`^ufcrm\\d+${normalizeKey(code)}$`);
    return (
        Object.keys(item).find(key => pattern.test(normalizeKey(key))) ?? null
    );
};

const readString = (value: unknown): string | null => {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const text = String(value).trim();
    return text || null;
};

const readBoolean = (value: unknown): boolean =>
    value === true || value === 'Y' || value === 'y' || value === 1;

const readStrings = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        const single = readString(value);
        return single ? [single] : [];
    }
    return value
        .map(readString)
        .filter((text): text is string => text !== null);
};

const readField = (
    item: Record<string, unknown>,
    code: ZprFieldCode,
): unknown => {
    const key = findZprItemKey(item, code);
    return key ? item[key] : undefined;
};

/** Сырой элемент crm.item → доменный ЗПР; без id — null (битая строка). */
export const mapZprItem = (
    raw: Record<string, unknown>,
    entityTypeId: number,
): ZprCall | null => {
    const id = Number(raw.id);
    if (!Number.isFinite(id) || id <= 0) return null;
    return {
        id,
        entityTypeId,
        categoryId: Number(raw.categoryId ?? 0),
        title: readString(raw.title) ?? `ЗПР №${id}`,
        stageId: readString(raw.stageId) ?? '',
        planDate: readString(readField(raw, ZPR_FIELD_CODES.PLAN_DATE)),
        doneDate: readString(readField(raw, ZPR_FIELD_CODES.DONE_DATE)),
        isSpontaneous: readBoolean(
            readField(raw, ZPR_FIELD_CODES.IS_SPONTANEOUS),
        ),
        planComment: readString(readField(raw, ZPR_FIELD_CODES.PLAN_COMMENT)),
        reportComment: readString(
            readField(raw, ZPR_FIELD_CODES.REPORT_COMMENT),
        ),
        comments: readStrings(readField(raw, ZPR_FIELD_CODES.COMMENTS)),
    };
};
