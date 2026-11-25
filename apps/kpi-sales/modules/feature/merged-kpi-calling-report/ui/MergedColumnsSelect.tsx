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
    /** Все колонки объединённой таблицы в порядке таблицы. */
    columns: readonly string[];
    /** Сохранённый выбор показателей; пусто — «все». */
    selectedActions: readonly string[];
    onChange: (selectedActions: string[]) => void;
}

const CAPTION = 'Колонки';
const ALL_LABEL = 'Показать все';

/**
 * Настройка колонок объединённой таблицы: кнопка рядом с таблицей, в списке —
 * названия колонок с отметками. Пока выбор не сужали, отмечены все; кнопка
 * показывает «Все» или «N из M». Строка «Показать все» возвращает все колонки.
 */
export const MergedColumnsSelect = ({
    columns,
    selectedActions,
    onChange,
}: MergedColumnsSelectProps) => {
    const options = useMemo<MultiComboboxOption[]>(
        () => columns.map(column => ({ value: column, label: column })),
        [columns],
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
