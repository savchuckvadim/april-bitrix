'use client';

import { useMemo } from 'react';
import {
    MicroField,
    MultiCombobox,
    type MultiComboboxOption,
} from '@workspace/april-ui/fields';
import {
    resolveCheckedColumns,
    toSelectedActions,
} from '../lib/merged-table-selection.util';

interface MergedColumnsSelectProps {
    /** Все колонки объединённой таблицы в порядке таблицы (исходные названия). */
    columns: readonly string[];
    /** Сохранённый выбор показателей; пусто — «все». */
    selectedActions: readonly string[];
    onChange: (selectedActions: string[]) => void;
    /** Подписи колонок: исходное название → выводимое; нет записи — исходное. */
    columnLabels?: ReadonlyMap<string, string>;
}

const CAPTION = 'Колонки';
const ALL_LABEL = 'Показать все';

/**
 * Настройка колонок объединённой таблицы: кнопка рядом с таблицей, в списке —
 * названия колонок с отметками. Значение пункта — исходное название (так
 * хранится выбор), подпись — выводимое (своё название портала). Пока выбор
 * не сужали, отмечены все; кнопка показывает «Все» или «N из M». Строка
 * «Показать все» возвращает все колонки.
 */
export const MergedColumnsSelect = ({
    columns,
    selectedActions,
    onChange,
    columnLabels,
}: MergedColumnsSelectProps) => {
    const options = useMemo<MultiComboboxOption[]>(
        () =>
            columns.map(column => ({
                value: column,
                label: columnLabels?.get(column) ?? column,
            })),
        [columns, columnLabels],
    );
    const checked = useMemo(
        () => resolveCheckedColumns(columns, selectedActions),
        [columns, selectedActions],
    );

    return (
        <MicroField label={CAPTION}>
            <MultiCombobox
                ariaLabel={CAPTION}
                allLabel={ALL_LABEL}
                manyLabel={count =>
                    count === columns.length
                        ? 'Все'
                        : `${count} из ${columns.length}`
                }
                options={options}
                value={checked}
                disabled={columns.length === 0}
                searchPlaceholder="Поиск колонки…"
                emptyText="Ничего не найдено"
                className="h-7 w-36 text-xs"
                onChange={next => onChange(toSelectedActions(columns, next))}
            />
        </MicroField>
    );
};
