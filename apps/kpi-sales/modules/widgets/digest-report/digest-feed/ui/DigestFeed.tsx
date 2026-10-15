'use client';

import { DigestSection } from '../../digest-section';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { useDigestFeed } from '../hooks/use-digest-feed';
import { DigestFeedSection } from './DigestFeedSection';

/**
 * «Лента дня»: Сводный / По отделам / По группам, внутри — вкладки по
 * сотрудникам с саммари, режим «Все» (общая хронология), фильтры по исходу
 * и типу, порционный показ.
 */
export const DigestFeed = () => {
    const feed = useDigestFeed();

    const renderSection = (userIds?: Set<number>) => (
        <DigestFeedSection
            groups={feed.groups}
            userIds={userIds}
            names={feed.names}
            domain={feed.domain}
            listId={feed.listId}
            focusUserId={feed.focusUserId}
        />
    );

    return (
        <DigestSection
            widget="feed"
            title={`Лента дня (${feed.total})`}
            description="События с комментариями менеджеров: по сотруднику или общей хронологией, с фильтрами по исходу и типу"
        >
            {!feed.groups.length ? (
                <p className="py-4 text-sm text-muted-foreground">Событий за день нет</p>
            ) : (
                <ReportGroupTabs
                    presentUserIds={feed.presentUserIds}
                    renderSummary={() => renderSection()}
                    renderSection={userIds => renderSection(userIds)}
                />
            )}
        </DigestSection>
    );
};
