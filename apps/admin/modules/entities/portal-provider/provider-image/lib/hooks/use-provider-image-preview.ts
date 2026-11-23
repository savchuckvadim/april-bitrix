'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProviderImage, ProviderImageRole } from '../../model';
import { ProviderImageHelper } from '../api/provider-image-helper';
import { PROVIDER_IMAGE_FILE_CACHE_KEY } from '../provider-image.consts';

const helper = new ProviderImageHelper();

export interface ProviderImagePreview {
    /** objectURL для `<img src>`; null, пока файл не загружен или картинки нет */
    url: string | null;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Превью картинки: blob-запрос через транспорт админки, затем objectURL.
 * Ключ запроса несёт id картинки: при замене файла id меняется, и превью
 * берётся заново. objectURL освобождается при смене картинки и при размонтировании.
 */
export function useProviderImagePreview(
    image: Pick<ProviderImage, 'id' | 'rqId' | 'role'> | null,
): ProviderImagePreview {
    const rqId = image?.rqId;
    const role = image?.role;
    const query = useQuery({
        queryKey: [PROVIDER_IMAGE_FILE_CACHE_KEY, rqId, role, image?.id],
        queryFn: () => helper.fileBlob(rqId as number, role as ProviderImageRole),
        enabled: image !== null,
        staleTime: Infinity,
        retry: false,
    });
    const blob = query.data;
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!blob) {
            setObjectUrl(null);
            return undefined;
        }
        const created = URL.createObjectURL(blob);
        setObjectUrl(created);
        return () => URL.revokeObjectURL(created);
    }, [blob]);

    const url = blob ? objectUrl : null;

    return {
        url,
        isLoading: image !== null && !query.isError && url === null,
        isError: query.isError,
    };
}
