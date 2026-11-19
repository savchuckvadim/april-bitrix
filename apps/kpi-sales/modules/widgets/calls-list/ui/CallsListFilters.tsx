'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    MicroField,
    MicroSegmented,
    MicroSelect,
    MultiCombobox,
} from '@workspace/april-ui/fields';
import {
    CALLS_LIST_PERIOD_PROBLEM_TEXT,
    CALLS_LIST_TEXT,
    callsListManagerOptions,
    callsListTypeOptions,
    type CallsListFacets,
    type CallsListPatch,
    type CallsListPeriodProblem,
    type CallsListQuery,
} from '@/modules/entities/calls-list';
import {
    CALLS_LIST_REVIEW_OPTIONS,
    CALLS_LIST_SORT_OPTIONS,
    isCallsListReviewFilter,
    isCallsListSort,
} from '../lib/calls-list-filter-options';
import { CallsListPeriodFilter } from './components/CallsListPeriodFilter';
import { CallsListScoreFilter } from './components/CallsListScoreFilter';

const T = CALLS_LIST_TEXT.filters;
const COMBO = 'h-7 w-48 text-xs';

interface CallsListFiltersProps {
    query: CallsListQuery;
    /** Варианты сотрудников и типов за период; ещё не пришли — null. */
    facets: CallsListFacets | null;
    periodProblem: CallsListPeriodProblem | null;
    filtered: boolean;
    onChange: (patch: CallsListPatch) => void;
    onReset: () => void;
}

/**
 * Фильтры одной строкой (на узком экране переносятся): период, сотрудники,
 * тип звонка, оценка AI от–до, отзывы, порядок, сброс. Под строкой —
 * что не так с периодом.
 */
export const CallsListFilters = ({
    query,
    facets,
    periodProblem,
    filtered,
    onChange,
    onReset,
}: CallsListFiltersProps) => (
    <div className="space-y-1">
        <div
            role="group"
            aria-label={T.ariaLabel}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-3 py-2"
        >
            <CallsListPeriodFilter
                from={query.from}
                to={query.to}
                invalid={periodProblem !== null}
                onChange={onChange}
            />
            <MicroField label={T.managers}>
                <MultiCombobox
                    ariaLabel={T.managers}
                    allLabel={T.managersAll}
                    manyLabel={T.managersMany}
                    options={callsListManagerOptions(facets?.managers ?? [])}
                    value={query.managerIds}
                    disabled={facets === null}
                    searchPlaceholder={T.search}
                    emptyText={T.nothingFound}
                    className={COMBO}
                    onChange={managerIds => onChange({ managerIds })}
                />
            </MicroField>
            <MicroField label={T.types}>
                <MultiCombobox
                    ariaLabel={T.types}
                    allLabel={T.typesAll}
                    manyLabel={T.typesMany}
                    options={callsListTypeOptions(facets?.callTypes ?? [])}
                    value={query.callTypes}
                    disabled={facets === null}
                    searchPlaceholder={T.search}
                    emptyText={T.nothingFound}
                    className={COMBO}
                    onChange={callTypes => onChange({ callTypes })}
                />
            </MicroField>
            <CallsListScoreFilter
                scoreMin={query.scoreMin}
                scoreMax={query.scoreMax}
                onChange={onChange}
            />
            <MicroField label={T.reviews}>
                <MicroSegmented
                    ariaLabel={T.reviews}
                    size="xs"
                    options={CALLS_LIST_REVIEW_OPTIONS}
                    value={query.review}
                    onChange={value =>
                        isCallsListReviewFilter(value) && onChange({ review: value })
                    }
                />
            </MicroField>
            <MicroField label={T.sort}>
                <MicroSelect
                    ariaLabel={T.sort}
                    value={query.sort}
                    options={CALLS_LIST_SORT_OPTIONS}
                    className="h-7 max-w-52 text-xs"
                    onChange={value => isCallsListSort(value) && onChange({ sort: value })}
                />
            </MicroField>
            {filtered && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={onReset}
                >
                    <RotateCcw aria-hidden className="size-3.5" />
                    {T.reset}
                </Button>
            )}
        </div>
        {periodProblem && (
            <p role="alert" className="px-1 text-xs text-destructive">
                {CALLS_LIST_PERIOD_PROBLEM_TEXT[periodProblem]}
            </p>
        )}
    </div>
);
