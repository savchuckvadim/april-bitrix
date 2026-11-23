'use client';

import { useState } from 'react';
import { useRemoveProviderImage, useUploadProviderImage } from '../../../lib/hooks';
import { providerImageErrorMessage } from '../../../lib/provider-image-error.util';
import { checkProviderImageFile } from '../../../lib/provider-image-file.util';
import { PROVIDER_IMAGE_SLOT_TEXT, type ProviderImageRole } from '../../../model';

/**
 * Состояние одного слота: отправка с прогрессом, удаление с подтверждением,
 * понятная ошибка. Файл проверяется до отправки: тип и вес отсекаются сразу,
 * остальное проверяет бэк.
 */
export function useProviderImageSlot(rqId: number, role: ProviderImageRole) {
    const upload = useUploadProviderImage(rqId);
    const remove = useRemoveProviderImage(rqId);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const run = async (action: () => Promise<unknown>, fallback: string): Promise<void> => {
        setError(null);
        try {
            await action();
        } catch (caught) {
            setError(providerImageErrorMessage(caught, fallback));
        }
    };

    const pick = (file: File): void => {
        const problem = checkProviderImageFile(file);
        if (problem) {
            setError(problem);
            return;
        }
        setProgress(0);
        void run(
            () => upload.mutateAsync({ role, file, onProgress: setProgress }),
            PROVIDER_IMAGE_SLOT_TEXT.uploadError,
        ).finally(() => setProgress(null));
    };

    const confirmRemove = (): void => {
        void run(() => remove.mutateAsync(role), PROVIDER_IMAGE_SLOT_TEXT.removeError).finally(
            () => setConfirmOpen(false),
        );
    };

    return {
        progress,
        error,
        isBusy: progress !== null || remove.isPending,
        isRemoving: remove.isPending,
        isConfirmOpen,
        setConfirmOpen,
        pick,
        confirmRemove,
    };
}
