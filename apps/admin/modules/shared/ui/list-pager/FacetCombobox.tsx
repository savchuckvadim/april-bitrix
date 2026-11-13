'use client';

import type { AdminFacetValueDto } from '@workspace/nest-admin-api';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { FACET_ALL, facetOptions } from './facet-options';

interface FacetComboboxProps {
    label: string;
    /** Значения фильтра с числом записей; ещё не загружены — undefined. */
    facets: AdminFacetValueDto[] | undefined;
    /** Выбранное значение; не выбрано — все. */
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    /** Подпись значения (например, «Яндекс» вместо yandex). */
    labelOf?: (value: string) => string;
}

/** Фильтр серверного списка: одно значение из базы или «все», с числом записей. */
export function FacetCombobox({ label, facets, value, onChange, labelOf }: FacetComboboxProps) {
    return (
        <FieldCombobox
            label={label}
            options={facetOptions(facets ?? [], labelOf)}
            value={value ?? FACET_ALL}
            onChange={next => onChange(next === FACET_ALL ? undefined : next)}
            searchPlaceholder="Найти…"
            emptyText="Ничего не найдено"
            disabled={!facets}
        />
    );
}
