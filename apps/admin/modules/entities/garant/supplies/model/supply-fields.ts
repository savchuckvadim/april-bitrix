import type { GetSupplyResponseDto } from '@workspace/nest-admin-api';

/**
 * Описание полей вида поставки — один источник для таблицы, карточки и
 * формы, чтобы они не разъезжались при добавлении поля.
 *
 * Тексты договоров и КП хранятся шаблонами и зависят только от числа
 * одновременных доступов (ОД). Плейсхолдеры разворачивает бэк
 * (libs/garant/src/supply/lib/supply-template.util.ts).
 */
export type SupplyFieldKey = keyof GetSupplyResponseDto;

/** Как показывать значение поля */
export type SupplyFieldKind = 'short' | 'long' | 'number';

export interface SupplyFieldInfo {
    key: SupplyFieldKey;
    /** Подпись по-русски: в клиентских текстах кодов быть не должно */
    label: string;
    kind: SupplyFieldKind;
    /** Поясняем те поля, по названию которых не понять назначение */
    hint?: string;
}

export interface SupplyFieldGroup {
    /** Код раздела — для ключей React, наружу не показывается */
    id: string;
    title: string;
    description?: string;
    fields: readonly SupplyFieldInfo[];
}

/** Подстановки, доступные в текстах: показываем рядом с полями */
export const SUPPLY_TEMPLATE_HINTS: readonly string[] = [
    '{n} — число доступов цифрой: 5',
    '{words} — число прописью: пять, {Words} — с большой буквы',
    '{words:gen} — в падеже (nom, gen, dat, acc, ins, pre): пяти',
    '{words:gen:f} — с родом (m, f, n): одной',
    '{plural:доступ|доступа|доступов} — нужная форма слова по числу',
];

export const SUPPLY_FIELD_GROUPS: readonly SupplyFieldGroup[] = [
    {
        id: 'main',
        title: 'Основное',
        fields: [
            { key: 'name', label: 'Название', kind: 'short' },
            { key: 'fullName', label: 'Полное название', kind: 'short' },
            { key: 'shortName', label: 'Короткое название', kind: 'short' },
            {
                key: 'code',
                label: 'Код',
                kind: 'short',
                hint: 'По нему система находит поставку — менять не стоит',
            },
            {
                key: 'type',
                label: 'Тип',
                kind: 'short',
                hint: 'Интернет или Проксима',
            },
            {
                key: 'usersQuantity',
                label: 'Одновременных доступов',
                kind: 'number',
                hint: 'Сколько человек могут работать одновременно',
            },
            {
                key: 'coefficient',
                label: 'Коэффициент',
                kind: 'number',
                hint: 'Множитель цены универсальной линейки. На цены прайса не влияет',
            },
            { key: 'color', label: 'Цвет', kind: 'short' },
            { key: 'description', label: 'Описание', kind: 'long' },
        ],
    },
    {
        id: 'sale',
        title: 'Названия для продаж',
        fields: [
            { key: 'saleName_1', label: 'Название для продаж 1', kind: 'long' },
            { key: 'saleName_2', label: 'Название для продаж 2', kind: 'long' },
            { key: 'saleName_3', label: 'Название для продаж 3', kind: 'long' },
            {
                key: 'quantityForKp',
                label: 'Строка количества в предложении',
                kind: 'long',
            },
        ],
    },
    {
        id: 'contract',
        title: 'Договор',
        description:
            'Тексты попадают в договор. Можно использовать подстановки числа доступов.',
        fields: [
            { key: 'contractName', label: 'Название в договоре', kind: 'long' },
            {
                key: 'contractPropSuppliesQuantity',
                label: 'Количество поставок',
                kind: 'long',
            },
            {
                key: 'contractPropLoginsQuantity',
                label: 'Количество логинов',
                kind: 'long',
            },
            { key: 'contractProp1', label: 'Свойство 1', kind: 'long' },
            { key: 'contractProp2', label: 'Свойство 2', kind: 'long' },
            {
                key: 'contractPropComment',
                label: 'Примечание',
                kind: 'long',
            },
            {
                key: 'contractPropEmail',
                label: 'Про адрес электронной почты',
                kind: 'long',
            },
        ],
    },
    {
        id: 'lcontract',
        title: 'Лицензионный договор',
        description: 'Те же тексты для лицензионного договора.',
        fields: [
            {
                key: 'lcontractName',
                label: 'Название в договоре',
                kind: 'long',
            },
            { key: 'lcontractProp2', label: 'Свойство 2', kind: 'long' },
            {
                key: 'lcontractPropComment',
                label: 'Примечание',
                kind: 'long',
            },
            {
                key: 'lcontractPropEmail',
                label: 'Про адрес электронной почты',
                kind: 'long',
            },
        ],
    },
    {
        id: 'acontract',
        title: 'Отчёт о поставке',
        fields: [
            { key: 'acontractName', label: 'Название в отчёте', kind: 'long' },
            {
                key: 'acontractPropComment',
                label: 'Примечание',
                kind: 'long',
            },
        ],
    },
];

/** Все поля одним списком — для таблицы и проверок полноты */
export const SUPPLY_FIELDS: readonly SupplyFieldInfo[] =
    SUPPLY_FIELD_GROUPS.flatMap(group => group.fields);

/** Поля, которые показываем в таблице узкими колонками */
export const SUPPLY_TABLE_PRIMARY_KEYS: readonly SupplyFieldKey[] = [
    'name',
    'code',
    'type',
    'usersQuantity',
    'coefficient',
];

/** Сколько текстов договоров заполнено — для столбца «заполненность» */
export const SUPPLY_TEXT_KEYS: readonly SupplyFieldKey[] = SUPPLY_FIELDS.filter(
    field => field.kind === 'long',
).map(field => field.key);

export const countFilledTexts = (item: GetSupplyResponseDto): number =>
    SUPPLY_TEXT_KEYS.filter(key => {
        const value = item[key];
        return value !== null && value !== undefined && String(value) !== '';
    }).length;
