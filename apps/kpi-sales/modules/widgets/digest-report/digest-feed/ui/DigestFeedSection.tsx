'use client';

import type { CatalogNames } from '../../lib/catalog-names.util';
import { useDigestFeedSection } from '../hooks/use-digest-feed';
import type { FeedGroup } from '../lib/digest-feed.util';
import { DigestFeedEmployeeTabs } from './DigestFeedEmployeeTabs';
import { DigestFeedFilters } from './DigestFeedFilters';
import { DigestFeedList } from './DigestFeedList';

interface DigestFeedSectionProps {
    groups: FeedGroup[];
    /** Сотрудники секции (отдел/группа); нет — сводная по всем. */
    userIds?: Set<number>;
    names: CatalogNames;
    domain: string;
    listId: string;
    focusUserId: number | null;
}

/** Секция ленты: вкладки сотрудников, фильтры, порционный список. */
export const DigestFeedSection = ({
    groups,
    userIds,
    names,
    domain,
    listId,
    focusUserId,
}: DigestFeedSectionProps) => {
    const section = useDigestFeedSection(groups, names.types, userIds, focusUserId);

    if (!section.groups.length) {
        return <p className="py-3 text-sm text-muted-foreground">Событий за день нет</p>;
    }

    return (
        <div className="space-y-3">
            <DigestFeedEmployeeTabs
                groups={section.groups}
                allSummary={section.allSummary}
                selection={section.selection}
                onSelect={section.select}
            />
            <DigestFeedFilters
                stack={section.stack}
                onStack={section.changeStack}
                typeCode={section.typeCode}
                onType={section.changeType}
                typeOptions={section.typeOptions}
                shown={section.items.length}
                total={section.baseTotal}
            />
            <DigestFeedList
                items={section.visibleItems}
                hasMore={section.hasMore}
                onShowMore={section.showMore}
                names={names}
                domain={domain}
                listId={listId}
                showEmployeeName={section.showEmployeeName}
            />
        </div>
    );
};
