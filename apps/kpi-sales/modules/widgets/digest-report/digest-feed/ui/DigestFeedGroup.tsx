'use client';

import type { CatalogNames } from '../../lib/catalog-names.util';
import type { FeedGroup } from '../lib/digest-feed.util';
import { DigestRecordRow } from './DigestRecordRow';

interface DigestFeedGroupProps {
    group: FeedGroup;
    names: CatalogNames;
    domain: string;
    listId: string;
    /** Заголовок сотрудника не нужен, когда в ленте он один. */
    withHeader: boolean;
}

/** События одного сотрудника за день. */
export const DigestFeedGroup = ({
    group,
    names,
    domain,
    listId,
    withHeader,
}: DigestFeedGroupProps) => (
    <section>
        {withHeader && (
            <h4 className="mb-1 text-sm font-semibold">
                {group.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {group.records.length}
                </span>
            </h4>
        )}
        <ul>
            {group.records.map(record => (
                <DigestRecordRow
                    key={record.id}
                    record={record}
                    names={names}
                    domain={domain}
                    listId={listId}
                />
            ))}
        </ul>
    </section>
);
