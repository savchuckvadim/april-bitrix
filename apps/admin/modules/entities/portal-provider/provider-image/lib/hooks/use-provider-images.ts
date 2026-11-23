'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProviderImageRole } from '../../model';
import {
    ProviderImageHelper,
    type ProviderImageUploadProgress,
} from '../api/provider-image-helper';
import { PROVIDER_IMAGES_CACHE_KEY } from '../provider-image.consts';

const helper = new ProviderImageHelper();

/**
 * Картинки реквизитов поставщика. Повторов нет: до миграции бэк отвечает 500,
 * и раздел сразу показывает спокойное сообщение вместо серии запросов.
 */
export const useProviderImages = (rqId?: number) =>
    useQuery({
        queryKey: [PROVIDER_IMAGES_CACHE_KEY, rqId],
        queryFn: () => helper.list(rqId as number),
        enabled: rqId != null,
        retry: false,
    });

/** Любая запись меняет список: метаданные, размеры и id при замене файла. */
const useInvalidateImages = (rqId: number) => {
    const queryClient = useQueryClient();
    return () =>
        queryClient.invalidateQueries({
            queryKey: [PROVIDER_IMAGES_CACHE_KEY, rqId],
        });
};

export interface ProviderImageUploadVariables {
    role: ProviderImageRole;
    file: File;
    onProgress?: ProviderImageUploadProgress;
}

/** Загрузка или замена картинки роли. */
export const useUploadProviderImage = (rqId: number) => {
    const invalidate = useInvalidateImages(rqId);
    return useMutation({
        mutationFn: ({ role, file, onProgress }: ProviderImageUploadVariables) =>
            helper.upload(rqId, role, file, onProgress),
        onSuccess: invalidate,
    });
};

/** Удаление картинки роли. */
export const useRemoveProviderImage = (rqId: number) => {
    const invalidate = useInvalidateImages(rqId);
    return useMutation({
        mutationFn: (role: ProviderImageRole) => helper.remove(rqId, role),
        onSuccess: invalidate,
    });
};
