import { parseSettingList } from './setting-list';

/**
 * Настройка-поля портала (`pick` = `bitrix-*-fields` в дескрипторе бэка):
 * значение — UF-имена полей сущности через запятую. Пример — старые поля
 * ИНН портала (`inn_legacy_fields_*`), которые вкладка «ИНН» читает как
 * источник вариантов.
 */

/** Какой сущности поля выбираются — по коду выбора. */
export const BITRIX_FIELD_PICK_ENTITY = {
    'bitrix-deal-fields': 'deal',
    'bitrix-company-fields': 'company',
    'bitrix-lead-fields': 'lead',
} as const;

export type BitrixFieldPick = keyof typeof BITRIX_FIELD_PICK_ENTITY;
export type BitrixFieldEntity = (typeof BITRIX_FIELD_PICK_ENTITY)[BitrixFieldPick];

const isBitrixFieldPick = (pick: unknown): pick is BitrixFieldPick =>
    typeof pick === 'string' && pick in BITRIX_FIELD_PICK_ENTITY;

/** Сущность выбора полей; не выбор полей (сотрудники и т. п.) — `null`. */
export const bitrixFieldEntityOf = (pick: unknown): BitrixFieldEntity | null =>
    isBitrixFieldPick(pick) ? BITRIX_FIELD_PICK_ENTITY[pick] : null;

/** Значение настройки → UF-имена: верхний регистр, без повторов. */
export const parseFieldNames = (raw: unknown): string[] => [
    ...new Set(parseSettingList(raw).map(name => name.toUpperCase())),
];

interface PickableField {
    fieldName: string;
    title: string;
}

/**
 * Поля для списка выбора: сначала выбранные, затем остальные, совпавшие с
 * поиском по подписи или имени (без учёта регистра). Выбранные видны
 * всегда — иначе снять отметку можно было бы, только угадав поиск.
 */
export const orderPickableFields = <T extends PickableField>(
    fields: readonly T[],
    selected: ReadonlySet<string>,
    query: string,
): T[] => {
    const needle = query.trim().toLowerCase();
    const matches = (field: T): boolean =>
        !needle ||
        field.title.toLowerCase().includes(needle) ||
        field.fieldName.toLowerCase().includes(needle);
    const isSelected = (field: T): boolean =>
        selected.has(field.fieldName.toUpperCase());
    return [
        ...fields.filter(isSelected),
        ...fields.filter(field => !isSelected(field) && matches(field)),
    ];
};

/**
 * Выбранные имена, которых нет среди живых полей портала: поле удалили или
 * переименовали в Битриксе. Показываются отдельно, чтобы их можно было
 * снять, — молча выбрасывать чужой выбор нельзя.
 */
export const missingFieldNames = (
    selected: readonly string[],
    fields: readonly PickableField[],
): string[] => {
    const live = new Set(fields.map(field => field.fieldName.toUpperCase()));
    return selected.filter(name => !live.has(name));
};
