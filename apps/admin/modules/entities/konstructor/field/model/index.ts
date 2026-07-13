// Доменные алиасы глобального справочника полей конструктора (`fields`).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    CreateFieldDto,
    FieldResponseDto,
    UpdateFieldDto,
} from '@workspace/nest-pbx-install-api';

/** Поле конструктора (глобальный справочник `fields`). */
export type Field = FieldResponseDto;
/** Тело создания поля. */
export type FieldCreate = CreateFieldDto;
/** Тело частичного обновления поля. */
export type FieldUpdate = UpdateFieldDto;

/** Метаданные колонки таблицы полей. */
export interface FieldColumn {
    key: keyof Field;
    label: string;
}

/** Состав и порядок колонок таблицы полей. */
export const FIELD_COLUMNS: FieldColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'number', label: '№' },
    { key: 'name', label: 'Название' },
    { key: 'code', label: 'Код' },
    { key: 'type', label: 'Тип' },
    { key: 'isGeneral', label: 'Общее' },
    { key: 'isRequired', label: 'Обяз.' },
    { key: 'isActive', label: 'Активно' },
];

/** Тип поля булева флага в форме. */
export type FieldBooleanKey =
    | 'isGeneral'
    | 'isDefault'
    | 'isRequired'
    | 'isActive'
    | 'isPlural'
    | 'isClient';

/** Подписи булевых флагов поля. */
export const FIELD_BOOLEAN_LABELS: Record<FieldBooleanKey, string> = {
    isGeneral: 'Общее поле',
    isDefault: 'По умолчанию',
    isRequired: 'Обязательное',
    isActive: 'Активно',
    isPlural: 'Множественное',
    isClient: 'Поле клиента',
};

/** Подписи текстовых полей формы. */
export const FIELD_TEXT_LABELS: Record<string, string> = {
    name: 'Название',
    code: 'Символьный код',
    type: 'Тип (string/integer/boolean/date/…)',
    value: 'Значение по умолчанию',
    description: 'Описание',
    bitixId: 'Bitrix ID',
    bitrixTemplateId: 'Bitrix Template ID',
};
