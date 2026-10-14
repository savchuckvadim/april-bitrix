'use client';

import { SectionCard } from '@workspace/april-ui';
import { useDigestFeed } from '../hooks/use-digest-feed';
import { DigestFeedGroup } from './DigestFeedGroup';

/** «Лента дня»: все события с комментариями, по сотрудникам, хронологически. */
export const DigestFeed = () => {
    const feed = useDigestFeed();

    return (
        <SectionCard
            surface="glass"
            title={`Лента дня (${feed.total})`}
            description={`События с комментариями менеджеров — ${feed.scopeLabel}`}
            collapsible
            defaultOpen={feed.total <= 60}
        >
            {!feed.groups.length ? (
                <p className="py-4 text-sm text-muted-foreground">Событий за день нет</p>
            ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                    {feed.groups.map(group => (
                        <DigestFeedGroup
                            key={group.userId}
                            group={group}
                            names={feed.names}
                            domain={feed.domain}
                            listId={feed.listId}
                            withHeader={feed.groups.length > 1}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    );
};
