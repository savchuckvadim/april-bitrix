/**
 * Панель бейджей «Разборов звонков»: что нарисовать в чипах и в списке
 * «Добавить фильтр». Чистые преобразования фасетов ответа в данные для
 * `FilterChips` и `MultiCombobox`.
 */
import type { FilterChipItem, MultiComboboxOption } from '@workspace/april-ui/fields';
import {
    CALLS_LIST_BADGE_TONE,
    callsListBadgeHint,
    callsListPointCount,
    callsListPointHint,
    callsListPointId,
    callsListPointLabel,
    callsListPointState,
    type CallsListBadgeFacet,
    type CallsListFacets,
    type CallsListPointFacet,
    type CallsListPointFilter,
} from '@/modules/entities/calls-list';

const countHint = (count: number): string => count.toLocaleString('ru-RU');

/** Есть ли что показать в панели: общие бейджи или пункты методики. */
export const hasCallsListBadgeBar = (facets: CallsListFacets | null | undefined): boolean =>
    (facets?.badges?.length ?? 0) > 0 || (facets?.points?.length ?? 0) > 0;

/** Чипы общих бейджей: число — сколько разборов останется с этим бейджем. */
export const callsListBadgeChips = (
    visible: readonly CallsListBadgeFacet[],
    selected: readonly string[],
): FilterChipItem[] =>
    visible.map(facet => ({
        id: facet.id,
        label: facet.title,
        count: facet.count,
        hint: callsListBadgeHint(facet),
        tone: CALLS_LIST_BADGE_TONE[facet.tone],
        selected: selected.includes(facet.id),
    }));

/**
 * Чипы пунктов методики: подпись и число по состоянию («не исполнено» —
 * красный, «исполнено» — зелёный); id чипа — код пункта.
 */
export const callsListPointChips = (
    visible: readonly CallsListPointFacet[],
    points: readonly CallsListPointFilter[],
): FilterChipItem[] =>
    visible.map(facet => {
        const state = callsListPointState(points, facet.code);
        return {
            id: facet.code,
            label: callsListPointLabel(facet.label, state),
            count: callsListPointCount(facet, state),
            hint: callsListPointHint(facet),
            tone: state === 'done' ? 'success' : 'destructive',
            selected: state !== null,
        };
    });

/**
 * Список «Добавить фильтр»: все бейджи и пункты, которых нет в панели по
 * умолчанию. Групп у списка нет — пункты методики идут с её названием.
 */
export function callsListAddFilterOptions(facets: CallsListFacets): MultiComboboxOption[] {
    const methodology = facets.methodology?.title;
    const badges = (facets.badges ?? [])
        .filter(facet => !facet.main)
        .map(facet => ({
            value: facet.id,
            label: facet.title,
            hint: countHint(facet.count),
        }));
    const points = (facets.points ?? [])
        .filter(facet => !facet.main)
        .map(facet => ({
            value: callsListPointId(facet.code),
            label: methodology ? `${methodology}: ${facet.label}` : facet.label,
            hint: countHint(facet.missed),
        }));
    return [...badges, ...points];
}
