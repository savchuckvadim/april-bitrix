import type { InitV2Data } from '@/modules/entities/catalog';
import { withBasePath } from '@/modules/shared/lib/base-path';
import type { PublicLinkMeta } from '../../model/types';

const HTTP_GONE = 410;
const HTTP_TOO_MANY = 429;

/** Ссылку отозвали или срок вышел: снаружи это один случай. */
export class PublicLinkGoneError extends Error {
    constructor() {
        super('Ссылка больше не действует');
        this.name = 'PublicLinkGoneError';
    }
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

    private url(token: string, suffix = ''): string {
        return withBasePath(`/api/public/${encodeURIComponent(token)}${suffix}`);
    }

    private async request(url: string): Promise<Response> {
        const response = await fetch(url);
        if (response.status === HTTP_GONE) throw new PublicLinkGoneError();
        if (response.status === HTTP_TOO_MANY) {
            throw new Error('Слишком много запросов, повторите через минуту');
        }
        if (!response.ok) throw new Error('Сервис недоступен, попробуйте позже');
        return response;
    }
}
