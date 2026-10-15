'use client';

import { Button } from '@workspace/ui/components/button';
import type { CatalogNames } from '../../lib/catalog-names.util';
import { FEED_PAGE_SIZE, type FeedItem } from '../lib/digest-feed.util';
import { DigestRecordRow } from './DigestRecordRow';

interface DigestFeedListProps {
    items: FeedItem[];
    hasMore: boolean;
    onShowMore: () => void;
    names: CatalogNames;
    domain: string;
    listId: string;
    showEmployeeName: boolean;
}

/** Порционный список событий; «Показать ещё» догружает следующую порцию. */
export const DigestFeedList = ({
    items,
    hasMore,
    onShowMore,
    names,
    domain,
    listId,
    showEmployeeName,
}: DigestFeedListProps) => {
    if (!items.length) {
        return <p className="py-3 text-sm text-muted-foreground">Под фильтры ничего не попало</p>;
    }
    return (
        <div>
            <ul>
                {items.map(item => (
                    <DigestRecordRow
                        key={item.record.id}
                        record={item.record}
                        names={names}
                        domain={domain}
                        listId={listId}
                        employeeName={showEmployeeName ? item.userName : undefined}
                    />
                ))}
            </ul>
            {hasMore && (
                <div className="pt-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onShowMore}>
                        Показать ещё {FEED_PAGE_SIZE}
                    </Button>
                </div>
            )}
        </div>
    );
};
