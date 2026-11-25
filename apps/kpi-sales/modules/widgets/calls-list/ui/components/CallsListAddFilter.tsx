'use client';

import { MultiCombobox, type MultiComboboxOption } from '@workspace/april-ui/fields';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';

const T = CALLS_LIST_TEXT;

interface CallsListAddFilterProps {
    /** Бейджи и пункты методики, которых нет в панели по умолчанию. */
    options: readonly MultiComboboxOption[];
    /** Добавленные пользователем (id). */
    value: readonly string[];
    onChange: (value: string[]) => void;
}

/**
 * «Добавить фильтр»: список бейджей, которых нет в панели по умолчанию.
 * Отметка выводит бейдж в панель, снятие — убирает (и сбрасывает его фильтр).
 */
export const CallsListAddFilter = ({ options, value, onChange }: CallsListAddFilterProps) => (
    <MultiCombobox
        ariaLabel={T.badges.addFilterAria}
        allLabel={T.badges.addFilter}
        manyLabel={T.badges.addFilterMany}
        options={options}
        value={value}
        searchPlaceholder={T.filters.search}
        emptyText={T.filters.nothingFound}
        className="h-7 w-44 text-xs"
        onChange={onChange}
    />
);
