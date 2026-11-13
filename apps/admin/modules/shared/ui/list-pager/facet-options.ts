import type { AdminFacetValueDto } from '@workspace/nest-admin-api';
import type { ComboboxOption } from '@workspace/april-ui/fields';

/** Значение «все» в выборе фильтра: в запрос не уходит. */
export const FACET_ALL = '__all__';

/**
 * Варианты выбора фильтра: «Все» первым, дальше значения из базы с числом
 * записей — «Яндекс · 412».
 */
export function facetOptions(
    facets: readonly AdminFacetValueDto[],
    labelOf: (value: string) => string = value => value,
): ComboboxOption[] {
    return [
        { value: FACET_ALL, label: 'Все' },
        ...facets.map(facet => ({
            value: facet.value,
            label: `${labelOf(facet.value)} · ${facet.count.toLocaleString('ru-RU')}`,
            keywords: [facet.value],
        })),
    ];
}
