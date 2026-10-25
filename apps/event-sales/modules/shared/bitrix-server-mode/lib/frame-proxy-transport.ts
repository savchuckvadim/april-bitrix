import type {
    BitrixServerBatchAnswer,
    BitrixServerCommand,
    BitrixServerTransport,
} from '@workspace/bitrix';
import { customAxios } from '@workspace/nest-event-sales-api';

/** Ручки бэка event-sales (bitrix-proxy/frame) — под portal-context сессией. */
export const FRAME_PROXY_CALL_URL = '/api/bitrix-proxy/frame/call';
export const FRAME_PROXY_BATCH_URL = '/api/bitrix-proxy/frame/batch';

/** Чей портал и кто просит — сервер сверяет с сессией и пишет в журнал. */
export interface FrameProxyIdentity {
    domain: string;
    requesterUserId: string;
}

interface FrameProxyCallResponse {
    ok: boolean;
    answer?: Record<string, unknown>;
    error?: string;
    errorDescription?: string;
}

/** Ошибка Битрикса, выполненного сервером: код и текст — как у SDK. */
export class FrameProxyError extends Error {
    constructor(
        readonly code: string,
        readonly description: string,
    ) {
        super(description || code || 'Ошибка Битрикс24');
        this.name = 'FrameProxyError';
    }
}

/**
 * Транспорт «через сервер» для BitrixBaseApi: те же вызовы, что фрейм
 * сделал бы сам, уходят на бэк event-sales. Перед запросом — сессия
 * (открывается лениво, один раз).
 */
export const createFrameProxyTransport = (
    identity: FrameProxyIdentity,
    ensureSession: () => Promise<void>,
): BitrixServerTransport => ({
    async call(method: string, params: unknown) {
        await ensureSession();
        const response = await customAxios<FrameProxyCallResponse>({
            url: FRAME_PROXY_CALL_URL,
            method: 'POST',
            data: { ...identity, method, params: params ?? {} },
        });
        if (!response.ok) {
            throw new FrameProxyError(
                response.error ?? '',
                response.errorDescription ?? '',
            );
        }
        return response.answer ?? {};
    },

    async batch(commands: Record<string, BitrixServerCommand>) {
        await ensureSession();
        return customAxios<BitrixServerBatchAnswer>({
            url: FRAME_PROXY_BATCH_URL,
            method: 'POST',
            data: { ...identity, commands },
        });
    },
});
