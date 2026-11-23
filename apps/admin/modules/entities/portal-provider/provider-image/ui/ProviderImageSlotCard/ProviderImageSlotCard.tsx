'use client';

import { Button } from '@workspace/ui/components/button';
import { Progress } from '@workspace/ui/components/progress';
import { describeProviderImage } from '../../lib/provider-image-file.util';
import { PROVIDER_IMAGE_SLOT_TEXT, type ProviderImageSlot } from '../../model';
import { ProviderImageFileButton } from '../ProviderImageFileButton';
import { ProviderImagePreview } from '../ProviderImagePreview';
import { ProviderImageRemoveDialog } from '../ProviderImageRemoveDialog';
import { useProviderImageSlot } from './hooks/use-provider-image-slot';

interface ProviderImageSlotCardProps {
    rqId: number;
    slot: ProviderImageSlot;
}

/** Слот роли: подпись, превью, сводка по файлу, загрузка или замена, удаление. */
export function ProviderImageSlotCard({ rqId, slot }: ProviderImageSlotCardProps) {
    const { role, label, hint, image } = slot;
    const state = useProviderImageSlot(rqId, role);

    return (
        <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
            <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">{label}</h4>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>

            <ProviderImagePreview image={image} label={label} />

            {image && (
                <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p>{describeProviderImage(image)}</p>
                    <p className="truncate" title={image.originalName ?? undefined}>
                        {image.originalName ?? PROVIDER_IMAGE_SLOT_TEXT.unnamedFile}
                    </p>
                </div>
            )}

            <div className="mt-auto flex flex-wrap gap-2">
                <ProviderImageFileButton
                    label={image ? PROVIDER_IMAGE_SLOT_TEXT.replace : PROVIDER_IMAGE_SLOT_TEXT.upload}
                    disabled={state.isBusy}
                    onPick={state.pick}
                />
                {image && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={state.isBusy}
                        onClick={() => state.setConfirmOpen(true)}
                    >
                        {PROVIDER_IMAGE_SLOT_TEXT.remove}
                    </Button>
                )}
            </div>

            {state.progress !== null && (
                <div className="space-y-1">
                    <Progress value={state.progress} />
                    <p className="text-xs text-muted-foreground">
                        {PROVIDER_IMAGE_SLOT_TEXT.uploading}: {state.progress} %
                    </p>
                </div>
            )}
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <ProviderImageRemoveDialog
                open={state.isConfirmOpen}
                onOpenChange={state.setConfirmOpen}
                roleLabel={label}
                isRemoving={state.isRemoving}
                onConfirm={state.confirmRemove}
            />
        </article>
    );
}
