'use client';

import { useMemo } from 'react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Spinner } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { BITRIX_SITE_URL } from '@/modules/shared/lib/bitrix-site-url';
import { SITE_MEDIA_TEXT } from '../consts/site-media.consts';
import { useSiteMediaList } from '../lib/hooks/use-site-media';
import { buildSiteMediaBoard } from '../lib/site-media-board';
import { SiteMediaOrphans } from './SiteMediaOrphans';
import { SiteMediaSlotCard } from './SiteMediaSlotCard';

/**
 * «Сайт → Картинки и видео»: места кадров продающего раздела по страницам.
 * Файлы лежат на сервере (storage), сайт сверяет список раз в минуту —
 * загруженное появляется без выкладки.
 */
export function SiteMediaBoard() {
    const list = useSiteMediaList();
    const board = useMemo(() => buildSiteMediaBoard(list.data ?? []), [list.data]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{SITE_MEDIA_TEXT.title}</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">{SITE_MEDIA_TEXT.description}</p>
                <div className="flex flex-wrap gap-2">
                    <ToneBadge tone="primary" variant="soft">
                        {SITE_MEDIA_TEXT.uploaded}: {board.uploaded} из {board.total}
                    </ToneBadge>
                    {board.firstPriorityMissing > 0 && (
                        <ToneBadge tone="warning" variant="soft">
                            {SITE_MEDIA_TEXT.firstPriorityMissing}: {board.firstPriorityMissing}
                        </ToneBadge>
                    )}
                </div>
            </div>

            {list.isLoading && <Spinner />}
            {list.isError && <p className="text-sm text-destructive">{SITE_MEDIA_TEXT.loadError}</p>}

            {list.isSuccess &&
                board.pages.map(page => (
                    <SectionCard
                        key={page.path}
                        title={page.title}
                        description={
                            <span className="flex flex-wrap gap-x-3">
                                <span>
                                    {SITE_MEDIA_TEXT.uploaded}: {page.uploaded} из {page.slots.length}
                                </span>
                                <a
                                    href={`${BITRIX_SITE_URL}${page.path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    {SITE_MEDIA_TEXT.openPage} {page.path}
                                </a>
                            </span>
                        }
                        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                    >
                        {page.slots.map(slot => (
                            <SiteMediaSlotCard key={slot.id} {...slot} />
                        ))}
                    </SectionCard>
                ))}

            {list.isSuccess && <SiteMediaOrphans items={board.orphans} />}
        </div>
    );
}
