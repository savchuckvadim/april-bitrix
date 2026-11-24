'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProviderImageHelper } from '../api/provider-image-helper';
import { PROVIDER_IMAGES_CACHE_KEY } from '../provider-image.consts';

const helper = new ProviderImageHelper();

export interface ProviderImageLegacyImportVariables {
    /** Картинки PNG/JPG из выбранной папки */
    files: File[];
    /** true только проверяет, false переносит */
    dryRun: boolean;
}

/**
 * Проверка и перенос картинок из легаси. После настоящего переноса список
 * картинок всех реквизитов перечитывается: ключ без rqId сбрасывает каждый
 * `ProviderImagesSection` страницы. Проверка кэш не трогает.
 */
export const useProviderImageLegacyImport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ files, dryRun }: ProviderImageLegacyImportVariables) =>
            helper.legacyImport(files, dryRun),
        onSuccess: (_report, { dryRun }) => {
            if (dryRun) return undefined;
            return queryClient.invalidateQueries({ queryKey: [PROVIDER_IMAGES_CACHE_KEY] });
        },
    });
};
