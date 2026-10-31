import type { InitV2Data } from '@/modules/entities/catalog';
import type { ComplectDescriptionContent } from '@/modules/entities/complect-description';
import { withBasePath } from '@/modules/shared/lib/base-path';
import type { PublicLinkMeta } from '../../model/types';
import { parseAttachmentName } from '../attachment-name.util';

const FALLBACK_DOCUMENT_NAME = 'Описание комплекта.docx';
const HTTP_GONE = 410;
const HTTP_TOO_MANY = 429;

/** Ссылку отозвали или срок вышел: снаружи это один случай. */
export class PublicLinkGoneError extends Error {
    constructor() {
        super('Ссылка больше не действует');
        this.name = 'PublicLinkGoneError';
    }
}

export interface PublicDescriptionFile {
    blob: Blob;
    documentName: string;
}

/**
 * Запросы публичной версии. Ходят в свой Next-прокси (app/api/public): адрес
 * бэка браузеру не нужен, поэтому сгенерированного клиента здесь нет.
 */
export class PublicLinkHelper {
    async meta(token: string): Promise<PublicLinkMeta> {
        const response = await this.request(this.url(token));
        return (await response.json()) as PublicLinkMeta;
    }

    async catalog(token: string): Promise<InitV2Data> {
        const response = await this.request(this.url(token, '/catalog'));
        return (await response.json()) as InitV2Data;
    }

    async description(
        token: string,
        content: ComplectDescriptionContent,
    ): Promise<PublicDescriptionFile> {
        const response = await this.request(this.url(token, '/description'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content),
        });
        return {
            blob: await response.blob(),
            documentName: parseAttachmentName(
                response.headers.get('Content-Disposition'),
                FALLBACK_DOCUMENT_NAME,
            ),
        };
    }

    private url(token: string, suffix = ''): string {
        return withBasePath(`/api/public/${encodeURIComponent(token)}${suffix}`);
    }

    private async request(url: string, init?: RequestInit): Promise<Response> {
        const response = await fetch(url, init);
        if (response.status === HTTP_GONE) throw new PublicLinkGoneError();
        if (response.status === HTTP_TOO_MANY) {
            throw new Error('Слишком много запросов, повторите через минуту');
        }
        if (!response.ok) throw new Error('Сервис недоступен, попробуйте позже');
        return response;
    }
}
