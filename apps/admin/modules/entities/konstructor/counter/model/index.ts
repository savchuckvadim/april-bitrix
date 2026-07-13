// Доменные алиасы глобального справочника счётчиков конструктора (`counters`).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    CounterResponseDto,
    CreateCounterDto,
    UpdateCounterDto,
} from '@workspace/nest-pbx-install-api';

/** Счётчик конструктора (глобальный справочник `counters`). */
export type Counter = CounterResponseDto;
/** Тело создания счётчика. */
export type CounterCreate = CreateCounterDto;
/** Тело частичного обновления счётчика. */
export type CounterUpdate = UpdateCounterDto;

/** Метаданные колонки таблицы счётчиков. */
export interface CounterColumn {
    key: keyof Counter;
    label: string;
}

/** Состав и порядок колонок таблицы счётчиков. */
export const COUNTER_COLUMNS: CounterColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Системное имя' },
    { key: 'title', label: 'Название' },
];
