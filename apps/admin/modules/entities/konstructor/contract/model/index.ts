// Доменные алиасы глобального справочника видов договоров (`contracts`).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type { ContractResponseDto } from '@workspace/nest-pbx-install-api';

/** Глобальный вид договора (read-only справочник). */
export type Contract = ContractResponseDto;

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
