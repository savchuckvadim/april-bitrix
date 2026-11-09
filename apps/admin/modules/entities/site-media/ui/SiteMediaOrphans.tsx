'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import type { SiteMediaItem } from '@workspace/site-media';
import { SITE_MEDIA_TEXT } from '../consts/site-media.consts';
import { formatFileSize } from '../lib/check-media-file';
import { useRemoveSiteMedia } from '../lib/hooks/use-site-media';

/** Файлы мест, которых больше нет на страницах сайта: показать и дать удалить. */
export function SiteMediaOrphans({ items }: { items: readonly SiteMediaItem[] }) {
    const remove = useRemoveSiteMedia();
    if (items.length === 0) return null;

    return (
        <SectionCard
            title={SITE_MEDIA_TEXT.orphansTitle}
            description={SITE_MEDIA_TEXT.orphansDescription}
            contentClassName="space-y-2"
        >
            {items.map(item => (
                <div key={item.slot} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                        <code className="text-primary">{item.slot}</code> · {formatFileSize(item.size)}
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(item.slot)}
                    >
                        {SITE_MEDIA_TEXT.remove}
                    </Button>
                </div>
            ))}
        </SectionCard>
    );
}
