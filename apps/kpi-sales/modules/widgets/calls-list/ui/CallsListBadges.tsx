'use client';

import { FilterChips } from '@workspace/april-ui/fields';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALLS_LIST_TEXT,
    cycleCallsListPoint,
    dropCallsListFilters,
    splitCallsListBadges,
    splitCallsListPoints,
    toggleCallsListBadge,
    type CallsListFacets,
    type CallsListPatch,
    type CallsListQuery,
} from '@/modules/entities/calls-list';
// Прямой путь: барель ui-settings тянет слушатели стора — виджету они не нужны.
import { useCallsListExtraBadges } from '@/modules/feature/ui-settings/lib/hooks/use-calls-list-extra-badges';
import {
    callsListAddFilterOptions,
    callsListBadgeChips,
    callsListPointChips,
} from '../lib/calls-list-badges-view';
import { CallsListAddFilter } from './components/CallsListAddFilter';
import { CallsListBadgesRow } from './components/CallsListBadgesRow';

const T = CALLS_LIST_TEXT.badges;

interface CallsListBadgesProps {
    /** Фасеты последнего ответа: бейджи, пункты и методика. */
    facets: CallsListFacets;
    query: Pick<CallsListQuery, 'badges' | 'points'>;
    /** Грузится новая страница — панель остаётся, пока не придёт ответ. */
    loading: boolean;
    onChange: (patch: CallsListPatch) => void;
}

/**
 * Панель бейджей над таблицей: ряд «Общие» (чипы-переключатели; бейджи одной
 * семьи сервер объединяет по «или»), ряд пунктов методики (нажатие по кругу: не исполнено,
 * исполнено, без фильтра) и «Добавить фильтр» для бейджей, которых нет в
 * панели по умолчанию. Добавленное запоминается у пользователя.
 */
export const CallsListBadges = ({ facets, query, loading, onChange }: CallsListBadgesProps) => {
    const { extraBadges, setExtraBadges } = useCallsListExtraBadges();
    const badges = splitCallsListBadges(facets.badges ?? [], query.badges, extraBadges);
    const points = splitCallsListPoints(facets.points ?? [], query.points, extraBadges);
    const addOptions = callsListAddFilterOptions(facets);
    const methodologyTitle = facets.methodology?.title ?? '';

    /** Убрали из «Добавить фильтр» — бейдж уходит из панели, его фильтр сбрасывается. */
    const changeExtra = (next: string[]) => {
        setExtraBadges(next);
        const dropped = dropCallsListFilters(
            query,
            extraBadges.filter(id => !next.includes(id)),
        );
        if (dropped) onChange(dropped);
    };

    return (
        <div
            role="group"
            aria-label={T.ariaLabel}
            aria-busy={loading}
            className={cn(
                'flex flex-wrap items-start gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-3 py-2 transition-opacity',
                loading && 'opacity-60',
            )}
        >
            <div className="min-w-0 flex-1 space-y-2">
                {badges.visible.length > 0 && (
                    <CallsListBadgesRow caption={T.general}>
                        <FilterChips
                            ariaLabel={T.generalAria}
                            items={callsListBadgeChips(badges.visible, query.badges)}
                            onToggle={id =>
                                onChange({ badges: toggleCallsListBadge(query.badges, id) })
                            }
                        />
                    </CallsListBadgesRow>
                )}
                {points.visible.length > 0 && (
                    <CallsListBadgesRow
                        caption={
                            methodologyTitle ? T.methodology(methodologyTitle) : T.points
                        }
                    >
                        <FilterChips
                            ariaLabel={methodologyTitle ? T.pointsAria(methodologyTitle) : T.points}
                            items={callsListPointChips(points.visible, query.points)}
                            onToggle={code =>
                                onChange({ points: cycleCallsListPoint(query.points, code) })
                            }
                        />
                    </CallsListBadgesRow>
                )}
            </div>
            {addOptions.length > 0 && (
                <CallsListAddFilter
                    options={addOptions}
                    value={extraBadges}
                    onChange={changeExtra}
                />
            )}
        </div>
    );
};
