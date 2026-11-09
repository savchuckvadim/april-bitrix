import { customAxios } from '@workspace/nest-admin-api';
import type { SiteMediaItem } from '@workspace/site-media';
import {
    SITE_MEDIA_API_BASE,
    SITE_MEDIA_UPLOAD_TIMEOUT_MS,
} from '../../consts/site-media.consts';

/** Что уходит в одной загрузке: кадр, постер видео или оба. */
export interface SiteMediaUploadParts {
    file?: File;
    poster?: File;
}

/** Доля отправленного, 0–100. */
export type SiteMediaUploadProgress = (percent: number) => void;

/**
 * Транспорт картинок и видео сайта (бэк: @lib/site-content, apps/admin).
 * Руками, как у остальных новых разделов: тот же мутатор `customAxios`,
 * что у сгенерированных клиентов.
 */
export class SiteMediaHelper {
    async list(section: string): Promise<SiteMediaItem[]> {
        const { items } = await customAxios<{ items: SiteMediaItem[] }>({
            url: `${SITE_MEDIA_API_BASE}/${section}`,
            method: 'GET',
        });
        return items;
    }

    upload(
        section: string,
        slot: string,
        parts: SiteMediaUploadParts,
        onProgress?: SiteMediaUploadProgress,
    ): Promise<SiteMediaItem> {
        const form = new FormData();
        if (parts.file) form.append('file', parts.file);
        if (parts.poster) form.append('poster', parts.poster);
        return customAxios<SiteMediaItem>({
            url: `${SITE_MEDIA_API_BASE}/${section}/${slot}`,
            method: 'PUT',
            data: form,
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: SITE_MEDIA_UPLOAD_TIMEOUT_MS,
            onUploadProgress: event => {
                if (onProgress && event.total) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            },
        });
    }

    removePoster(section: string, slot: string): Promise<SiteMediaItem> {
        return customAxios<SiteMediaItem>({
            url: `${SITE_MEDIA_API_BASE}/${section}/${slot}/poster`,
            method: 'DELETE',
        });
    }

    remove(section: string, slot: string): Promise<{ deleted: boolean }> {
        return customAxios<{ deleted: boolean }>({
            url: `${SITE_MEDIA_API_BASE}/${section}/${slot}`,
            method: 'DELETE',
        });
    }
}
