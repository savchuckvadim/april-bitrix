import { ToneBadge } from '@workspace/april-ui/badges';
import {
    CALLS_LIST_BADGE_TONE,
    CALLS_LIST_TEXT,
    callsListRowBadges,
    type CallsListItemBadge,
} from '@/modules/entities/calls-list';

const T = CALLS_LIST_TEXT.badges;

interface CallsListRowBadgesProps {
    /** Бейджи-проблемы звонка; старый бэк их не присылает. */
    badges: readonly CallsListItemBadge[] | undefined;
}

/**
 * Бейджи звонка в строке таблицы: первые несколько, остальные — «+N» с
 * подсказкой-списком. Звонок без бейджей — ничего не рисуем.
 */
export const CallsListRowBadges = ({ badges }: CallsListRowBadgesProps) => {
    const view = callsListRowBadges(badges);
    if (view.shown.length === 0) return null;
    return (
        <div className="mt-1 flex flex-wrap gap-1">
            {view.shown.map(badge => (
                <ToneBadge
                    key={badge.id}
                    tone={CALLS_LIST_BADGE_TONE[badge.tone]}
                    variant="soft"
                    size="sm"
                >
                    {badge.title}
                </ToneBadge>
            ))}
            {view.hiddenCount > 0 && (
                <ToneBadge tone="muted" variant="soft" size="sm" title={view.hiddenTitle}>
                    {T.rowMore(view.hiddenCount)}
                </ToneBadge>
            )}
        </div>
    );
};
