'use client';

import type { FeedSelection } from '../hooks/use-digest-feed';
import type { FeedGroup, FeedSummary } from '../lib/digest-feed.util';
import { DigestFeedEmployeeChip } from './DigestFeedEmployeeChip';

interface DigestFeedEmployeeTabsProps {
    groups: FeedGroup[];
    allSummary: FeedSummary;
    selection: FeedSelection;
    onSelect: (selection: FeedSelection) => void;
}

/** «Все» + по вкладке на сотрудника с саммари; у одного сотрудника вкладок нет. */
export const DigestFeedEmployeeTabs = ({
    groups,
    allSummary,
    selection,
    onSelect,
}: DigestFeedEmployeeTabsProps) => {
    if (groups.length <= 1) return null;
    return (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Сотрудники ленты">
            <DigestFeedEmployeeChip
                label="Все"
                summary={allSummary}
                active={selection === 'all'}
                onClick={() => onSelect('all')}
            />
            {groups.map(group => (
                <DigestFeedEmployeeChip
                    key={group.userId}
                    label={group.name}
                    summary={group.summary}
                    active={selection === group.userId}
                    onClick={() => onSelect(group.userId)}
                />
            ))}
        </div>
    );
};
