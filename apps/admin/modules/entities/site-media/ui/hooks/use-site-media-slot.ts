'use client';

import { useState } from 'react';
import { checkMediaFile, type SiteMediaPickTarget } from '../../lib/check-media-file';
import {
    useRemoveSiteMedia,
    useRemoveSiteMediaPoster,
    useUploadSiteMedia,
} from '../../lib/hooks/use-site-media';
import { siteMediaErrorMessage } from '../../lib/site-media-error';

/**
 * Состояние одного места кадра: отправка с прогрессом, снятие постера,
 * удаление с подтверждением, понятная ошибка. Файл проверяется до
 * отправки — чтобы не ждать загрузку ролика ради отказа.
 */
export function useSiteMediaSlot(slot: string) {
    const upload = useUploadSiteMedia();
    const removePoster = useRemoveSiteMediaPoster();
    const remove = useRemoveSiteMedia();
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const run = async (action: () => Promise<unknown>): Promise<void> => {
        setError(null);
        try {
            await action();
        } catch (caught) {
            setError(siteMediaErrorMessage(caught));
        }
    };

    const pick = (target: SiteMediaPickTarget, file: File): void => {
        const problem = checkMediaFile(file, target);
        if (problem) {
            setError(problem);
            return;
        }
        const parts = target === 'poster' ? { poster: file } : { file };
        setProgress(0);
        void run(() =>
            upload.mutateAsync({ slot, parts, onProgress: setProgress }),
        ).finally(() => setProgress(null));
    };

    const confirmRemove = (): void => {
        void run(() => remove.mutateAsync(slot)).finally(() =>
            setConfirmOpen(false),
        );
    };

    return {
        progress,
        error,
        isBusy: progress !== null || removePoster.isPending || remove.isPending,
        isRemoving: remove.isPending,
        isConfirmOpen,
        setConfirmOpen,
        pick,
        dropPoster: () => void run(() => removePoster.mutateAsync(slot)),
        confirmRemove,
    };
}
