'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { Progress } from '@workspace/ui/components/progress';
import { ConfirmDialog } from '@/modules/shared/ui';
import { SITE_MEDIA_PRIORITY_LABEL, SITE_MEDIA_TEXT } from '../consts/site-media.consts';
import { formatFileSize } from '../lib/check-media-file';
import type { SiteMediaSlotView } from '../lib/site-media-board';
import { SiteMediaFileButton } from './SiteMediaFileButton';
import { SiteMediaPreview } from './SiteMediaPreview';
import { useSiteMediaSlot } from './hooks/use-site-media-slot';

const formatUpdatedAt = (iso: string): string =>
    new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });

/** Место кадра: превью, что снять, загрузка и замена, постер у видео, удаление. */
export function SiteMediaSlotCard({ id, spec, item }: SiteMediaSlotView) {
    const slot = useSiteMediaSlot(id);
    const isVideo = spec.kind === 'video';

    return (
        <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
            <SiteMediaPreview spec={spec} item={item} />

            <div className="flex flex-wrap items-center gap-1.5">
                <code className="text-xs text-primary">{id}</code>
                <ToneBadge tone="neutral" variant="outline" size="sm">
                    {isVideo ? SITE_MEDIA_TEXT.video : SITE_MEDIA_TEXT.image}
                </ToneBadge>
                <ToneBadge tone={spec.priority === 1 ? 'warning' : 'muted'} variant="soft" size="sm">
                    {SITE_MEDIA_PRIORITY_LABEL[spec.priority]}
                </ToneBadge>
                <ToneBadge tone={item ? 'success' : 'muted'} variant="soft" size="sm">
                    {item ? SITE_MEDIA_TEXT.hasFile : SITE_MEDIA_TEXT.noFile}
                </ToneBadge>
            </div>

            <p className="text-sm font-medium text-foreground">{spec.caption}</p>
            <dl className="space-y-1 text-xs text-muted-foreground">
                <div>
                    <dt className="inline font-medium">{SITE_MEDIA_TEXT.what}: </dt>
                    <dd className="inline">{spec.what}</dd>
                </div>
                <div>
                    <dt className="inline font-medium">{SITE_MEDIA_TEXT.where}: </dt>
                    <dd className="inline">{spec.where}</dd>
                </div>
            </dl>
            {item && (
                <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)} · {formatUpdatedAt(item.updatedAt)}
                </p>
            )}

            <div className="mt-auto flex flex-wrap gap-2">
                <SiteMediaFileButton
                    target={spec.kind}
                    label={item ? SITE_MEDIA_TEXT.replace : SITE_MEDIA_TEXT.upload}
                    disabled={slot.isBusy}
                    onPick={file => slot.pick(spec.kind, file)}
                />
                {item?.kind === 'video' && (
                    <SiteMediaFileButton
                        target="poster"
                        variant="outline"
                        label={item.poster ? SITE_MEDIA_TEXT.replacePoster : SITE_MEDIA_TEXT.uploadPoster}
                        disabled={slot.isBusy}
                        onPick={file => slot.pick('poster', file)}
                    />
                )}
                {item?.poster && (
                    <Button size="sm" variant="ghost" disabled={slot.isBusy} onClick={slot.dropPoster}>
                        {SITE_MEDIA_TEXT.removePoster}
                    </Button>
                )}
                {item && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={slot.isBusy}
                        onClick={() => slot.setConfirmOpen(true)}
                    >
                        {SITE_MEDIA_TEXT.remove}
                    </Button>
                )}
            </div>

            {slot.progress !== null && (
                <div className="space-y-1">
                    <Progress value={slot.progress} />
                    <p className="text-xs text-muted-foreground">
                        {SITE_MEDIA_TEXT.uploading}: {slot.progress} %
                    </p>
                </div>
            )}
            {slot.error && <p className="text-sm text-destructive">{slot.error}</p>}

            <ConfirmDialog
                open={slot.isConfirmOpen}
                onOpenChange={slot.setConfirmOpen}
                title={SITE_MEDIA_TEXT.removeTitle}
                description={SITE_MEDIA_TEXT.removeDescription}
                onConfirm={slot.confirmRemove}
                confirmLabel={SITE_MEDIA_TEXT.remove}
                variant="destructive"
                isLoading={slot.isRemoving}
            />
        </article>
    );
}
