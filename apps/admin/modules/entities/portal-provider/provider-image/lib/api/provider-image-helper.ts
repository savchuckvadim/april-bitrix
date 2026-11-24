import { customAxios } from '@workspace/nest-admin-api';
import { PROVIDER_IMAGES_API_BASE } from '../provider-image.consts';
import {
    PROVIDER_IMAGE_LEGACY_TIMEOUT_MS,
    PROVIDER_IMAGE_UPLOAD_TIMEOUT_MS,
    type ProviderImage,
    type ProviderImageLegacyImportReport,
    type ProviderImageRole,
} from '../../model';
import { buildLegacyImportForm } from '../provider-image-legacy-import.util';

/** Доля отправленного, 0–100. */
export type ProviderImageUploadProgress = (percent: number) => void;

const imagesUrl = (rqId: number): string =>
    `${PROVIDER_IMAGES_API_BASE}/rq/${rqId}/images`;

const roleUrl = (rqId: number, role: ProviderImageRole): string =>
    `${imagesUrl(rqId)}/${role}`;

/**
 * Транспорт картинок реквизитов поставщика (печать, подписи, логотип).
 * Руками, пока ручки не попали в orval: тот же мутатор `customAxios`, что у
 * сгенерированных клиентов, поэтому после `pnpm run generate` меняются только
 * тела методов (кроме `fileBlob`: бинарный ответ идёт мимо конверта).
 */
export class ProviderImageHelper {
    /** Картинки реквизитов; пусто, если ни одной не загружено. */
    list(rqId: number): Promise<ProviderImage[]> {
        return customAxios<ProviderImage[]>({
            url: imagesUrl(rqId),
            method: 'GET',
        });
    }

    /** Загрузка или замена картинки роли (`multipart/form-data`, поле `file`). */
    upload(
        rqId: number,
        role: ProviderImageRole,
        file: File,
        onProgress?: ProviderImageUploadProgress,
    ): Promise<ProviderImage> {
        const form = new FormData();
        form.append('file', file);
        return customAxios<ProviderImage>({
            url: roleUrl(rqId, role),
            method: 'PUT',
            data: form,
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: PROVIDER_IMAGE_UPLOAD_TIMEOUT_MS,
            onUploadProgress: (event) => {
                if (onProgress && event.total) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            },
        });
    }

    /**
     * Перенос картинок реквизитов из легаси по выбранной папке (ручка общая для
     * всех порталов). `dryRun` только проверяет и ничего не пишет; отчёт по
     * строкам приходит в обоих режимах.
     */
    legacyImport(
        files: readonly File[],
        dryRun: boolean,
    ): Promise<ProviderImageLegacyImportReport> {
        return customAxios<ProviderImageLegacyImportReport>({
            url: `${PROVIDER_IMAGES_API_BASE}/images/legacy-import`,
            method: 'POST',
            params: { dryRun },
            data: buildLegacyImportForm(files),
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: PROVIDER_IMAGE_LEGACY_TIMEOUT_MS,
        });
    }

    /**
     * Удаление: бэк отвечает 204 без тела; мутатор разворачивает конверт
     * `{ resultCode, data }`. Тип ответа `text` обходит развёртку и принимает
     * пустое тело.
     */
    async remove(rqId: number, role: ProviderImageRole): Promise<void> {
        await customAxios<string>({
            url: roleUrl(rqId, role),
            method: 'DELETE',
            responseType: 'text',
        });
    }

    /**
     * Сам файл (`image/png` или `image/jpeg`). Ручка за авторизацией, поэтому
     * `<img src>` её не загрузит: файл берётся blob-запросом через транспорт админки.
     */
    fileBlob(rqId: number, role: ProviderImageRole): Promise<Blob> {
        return customAxios<Blob>({
            url: `${roleUrl(rqId, role)}/file`,
            method: 'GET',
            responseType: 'blob',
        });
    }
}
