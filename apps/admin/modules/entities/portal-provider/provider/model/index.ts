// Доменные алиасы поставщика (agent) и его реквизитов (rq).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    CreateProviderWithRqDto,
    CreateRqDto,
    ProviderEnumsResponseDto,
    ProviderSelectOptionDto,
    ProviderWithRqResponseDto,
    RqResponseDto,
    UpdateRqDto,
} from '@workspace/nest-pbx-install-api';

/** Поставщик портала вместе с реквизитами (ответ бэка, слабо типизирован). */
export type Provider = ProviderWithRqResponseDto;
/** Реквизиты поставщика (ответ бэка, слабо типизирован). */
export type Rq = RqResponseDto;
/** Тело создания поставщика с реквизитами. */
export type CreateProviderWithRq = CreateProviderWithRqDto;
/** Тело создания реквизитов (полный набор полей). */
export type CreateRq = CreateRqDto;
/** Тело частичного обновления реквизитов. */
export type UpdateRq = UpdateRqDto;
/** Справочники select`ов поставщика. */
export type ProviderEnums = ProviderEnumsResponseDto;
/** Опция select`а типа поставщика/реквизитов. */
export type ProviderTypeOption = ProviderSelectOptionDto;

/** Группы полей реквизитов для отрисовки формы/таблицы. */
export type RqFieldGroup =
    | 'main'
    | 'legal'
    | 'ip'
    | 'person'
    | 'contacts'
    | 'bank';

/** Метаданные одного поля реквизитов: ключ DTO, подпись и группа. */
export interface RqFieldMeta {
    /** Ключ поля в {@link CreateRq}/{@link UpdateRq}. */
    key: keyof CreateRq;
    /** Человекочитаемая подпись для формы/таблицы. */
    label: string;
    /** Группа, к которой относится поле. */
    group: RqFieldGroup;
    /** Многострочное поле (textarea). */
    multiline?: boolean;
}

/** Подписи групп полей реквизитов. */
export const RQ_FIELD_GROUP_LABELS: Record<RqFieldGroup, string> = {
    main: 'Основное',
    legal: 'Юридическое лицо',
    ip: 'ИП',
    person: 'Физическое лицо',
    contacts: 'Адреса и контакты',
    bank: 'Банк',
};

/**
 * Состав и порядок полей реквизитов для UI. Источник правды по составу —
 * {@link CreateRq}/{@link UpdateRq}; здесь добавлены подписи и группировка.
 * Поле `type` редактируется отдельным select`ом (из enums), поэтому здесь не дублируется.
 */
export const PROVIDER_RQ_FIELDS: RqFieldMeta[] = [
    // Основное
    { key: 'name', label: 'Название набора', group: 'main' },
    { key: 'number', label: 'Номер/код', group: 'main' },
    // Юридическое лицо
    { key: 'fullname', label: 'Полное юр. наименование', group: 'legal' },
    { key: 'shortname', label: 'Краткое наименование', group: 'legal' },
    { key: 'director', label: 'ФИО руководителя', group: 'legal' },
    { key: 'position', label: 'Должность руководителя', group: 'legal' },
    { key: 'accountant', label: 'ФИО главного бухгалтера', group: 'legal' },
    { key: 'based', label: 'Основание полномочий', group: 'legal' },
    { key: 'inn', label: 'ИНН', group: 'legal' },
    { key: 'kpp', label: 'КПП', group: 'legal' },
    { key: 'ogrn', label: 'ОГРН', group: 'legal' },
    // ИП
    { key: 'ogrnip', label: 'ОГРНИП', group: 'ip' },
    // Физическое лицо
    { key: 'personName', label: 'ФИО физлица', group: 'person' },
    { key: 'document', label: 'Тип документа', group: 'person' },
    { key: 'docSer', label: 'Серия документа', group: 'person' },
    { key: 'docNum', label: 'Номер документа', group: 'person' },
    { key: 'docDate', label: 'Дата выдачи', group: 'person' },
    { key: 'docIssuedBy', label: 'Кем выдан', group: 'person' },
    { key: 'docDepCode', label: 'Код подразделения', group: 'person' },
    // Адреса и контакты
    { key: 'registredAdress', label: 'Юридический адрес', group: 'contacts' },
    { key: 'primaryAdresss', label: 'Фактический адрес', group: 'contacts' },
    { key: 'email', label: 'E-mail', group: 'contacts' },
    { key: 'garantEmail', label: 'E-mail для гарантийных писем', group: 'contacts' },
    { key: 'phone', label: 'Телефон', group: 'contacts' },
    { key: 'assigned', label: 'Ответственное лицо', group: 'contacts' },
    { key: 'assignedPhone', label: 'Телефон ответственного', group: 'contacts' },
    { key: 'other', label: 'Прочее', group: 'contacts', multiline: true },
    // Банк
    { key: 'bank', label: 'Наименование банка', group: 'bank' },
    { key: 'bik', label: 'БИК', group: 'bank' },
    { key: 'rs', label: 'Расчётный счёт', group: 'bank' },
    { key: 'ks', label: 'Корреспондентский счёт', group: 'bank' },
    { key: 'bankAdress', label: 'Адрес банка', group: 'bank' },
    { key: 'bankOther', label: 'Прочее о банке', group: 'bank', multiline: true },
];

/** Поля верхнего уровня поставщика (для формы создания). */
export const PROVIDER_FIELD_LABELS = {
    name: 'Название поставщика',
    code: 'Бизнес-код',
    number: 'Порядковый номер',
} as const;
