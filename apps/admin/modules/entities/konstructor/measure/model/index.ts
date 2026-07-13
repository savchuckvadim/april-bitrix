// Доменные алиасы глобального справочника единиц измерения (`measures`).
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type { MeasureResponseDto } from '@workspace/nest-pbx-install-api';

/** Глобальная единица измерения (read-only справочник). */
export type Measure = MeasureResponseDto;

/** Метаданные одной колонки таблицы единиц измерения. */
export interface MeasureColumn {
    /** Ключ поля в {@link Measure}. */
    key: keyof Measure;
    /** Человекочитаемая подпись колонки. */
    label: string;
}

/** Состав и порядок колонок таблицы глобальных единиц измерения. */
export const MEASURE_COLUMNS: MeasureColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Наименование' },
    { key: 'shortName', label: 'Краткое' },
    { key: 'fullName', label: 'Полное' },
    { key: 'code', label: 'Код' },
    { key: 'type', label: 'Тип' },
];
