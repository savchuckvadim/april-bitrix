// Доменные алиасы глобального справочника видов договоров (`contracts`).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type { UpdateContractDto } from '@workspace/nest-admin-api';
import type { ContractResponseDto } from '@workspace/nest-pbx-install-api';

/** Глобальный вид договора — общий для всех порталов. */
export type Contract = ContractResponseDto;

/** Правка вида договора (`PUT admin/contracts/:id`), все поля необязательны. */
export type ContractUpdate = UpdateContractDto;

/** Метаданные одной колонки таблицы видов договоров. */
export interface ContractColumn {
    /** Ключ поля в {@link Contract}. */
    key: keyof Contract;
    /** Человекочитаемая подпись колонки. */
    label: string;
}

/** Состав и порядок колонок таблицы глобальных видов договоров. */
export const CONTRACT_COLUMNS: ContractColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'number', label: 'Номер' },
    { key: 'name', label: 'Наименование' },
    { key: 'title', label: 'Заголовок' },
    { key: 'code', label: 'Код' },
    { key: 'type', label: 'Тип' },
    { key: 'withPrepayment', label: 'С предоплатой' },
    { key: 'coefficient', label: 'Коэффициент' },
    { key: 'prepayment', label: 'Предоплата' },
    { key: 'discount', label: 'Скидка' },
    { key: 'order', label: 'Порядок' },
];

/** Полный упорядоченный состав полей вида договора для страницы деталей. */
export const CONTRACT_FIELD_LABELS: ContractColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'number', label: 'Номер' },
    { key: 'name', label: 'Наименование' },
    { key: 'title', label: 'Заголовок' },
    { key: 'code', label: 'Код' },
    { key: 'type', label: 'Тип' },
    { key: 'withPrepayment', label: 'С предоплатой' },
    { key: 'coefficient', label: 'Коэффициент' },
    { key: 'prepayment', label: 'Предоплата' },
    { key: 'discount', label: 'Скидка' },
    { key: 'order', label: 'Порядок' },
    { key: 'template', label: 'Шаблон' },
    { key: 'productName', label: 'Наименование продукта' },
    { key: 'product', label: 'Продукт' },
    { key: 'service', label: 'Услуга' },
    { key: 'description', label: 'Описание' },
    { key: 'comment', label: 'Комментарий' },
    { key: 'comment1', label: 'Комментарий 1' },
    { key: 'comment2', label: 'Комментарий 2' },
    { key: 'created_at', label: 'Создан' },
    { key: 'updated_at', label: 'Обновлён' },
];

/**
 * Текстовые поля, которые правятся в админке. Код, номер, тип и цифры
 * расчёта (коэффициент, предоплата, скидка) остаются только на чтение:
 * по ним генерация и прайс выбирают шаблоны и считают суммы.
 */
export type ContractTextKey =
    | 'name'
    | 'title'
    | 'productName'
    | 'product'
    | 'service'
    | 'description'
    | 'comment'
    | 'comment1'
    | 'comment2';

/** Черновик формы правки: значения текстовых полей как строки. */
export type ContractDraft = Record<ContractTextKey, string>;

/** Описание одного поля формы правки. */
export interface ContractEditField {
    key: ContractTextKey;
    label: string;
    /** Многострочное поле. */
    multiline?: boolean;
    /** Пустым не сохраняется. */
    required?: boolean;
    /** Где подпись видна пользователю. */
    hint?: string;
}

/** Состав и порядок полей формы правки вида договора. */
export const CONTRACT_EDIT_FIELDS: ContractEditField[] = [
    {
        key: 'name',
        label: 'Наименование',
        required: true,
        hint: 'Подпись в новом конструкторе: селект договора, заявка на поставку, документы.',
    },
    {
        key: 'title',
        label: 'Заголовок',
        required: true,
        hint: 'Подпись в легаси-конструкторе (Laravel): селект договора, документы, отчёт о поставке.',
    },
    { key: 'productName', label: 'Наименование продукта' },
    { key: 'product', label: 'Продукт', multiline: true },
    { key: 'service', label: 'Услуга', multiline: true },
    { key: 'description', label: 'Описание', multiline: true },
    { key: 'comment', label: 'Комментарий', multiline: true },
    { key: 'comment1', label: 'Комментарий 1', multiline: true },
    { key: 'comment2', label: 'Комментарий 2', multiline: true },
];
