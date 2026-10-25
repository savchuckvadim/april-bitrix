import type { BxFrameAuth } from '@workspace/bitrix';
import {
    PORTAL_SESSION_OPEN_PATH,
    customAxios,
    getPortalSessionToken,
    setPortalSessionRefresh,
    setPortalSessionToken,
} from '@workspace/nest-event-sales-api';

/** Откуда брать данные входа фрейма — BitrixBaseApi из @workspace/bitrix. */
export interface PortalSessionFrameApi {
    getFrameAuth(): BxFrameAuth | null;
    refreshFrameAuth?(): Promise<BxFrameAuth | null>;
}

interface PortalSessionAnswer {
    token: string;
}

const exchange = async (auth: BxFrameAuth): Promise<string> =>
    (
        await customAxios<PortalSessionAnswer>({
            url: PORTAL_SESSION_OPEN_PATH,
            method: 'POST',
            data: {
                domain: auth.domain,
                accessToken: auth.accessToken,
                memberId: auth.memberId ?? undefined,
            },
        })
    ).token;

/** Свежие данные входа: обновлённые SDK, если старые протухли. */
const freshFrameAuth = async (
    api: PortalSessionFrameApi,
): Promise<BxFrameAuth | null> =>
    (api.refreshFrameAuth ? await api.refreshFrameAuth() : null) ??
    api.getFrameAuth();

/**
 * Сессия на сервере event-sales — только для работы через сервер, поэтому
 * открывается лениво: при первом таком запросе, один раз на вкладку
 * (одновременные запросы ждут одного обмена). На 401 переоткрывается
 * свежими данными фрейма (refresh в транспорте api-пакета).
 */
export const createPortalSessionOpener = (
    api: PortalSessionFrameApi,
): (() => Promise<void>) => {
    let opening: Promise<void> | null = null;

    const open = async (): Promise<void> => {
        const auth = api.getFrameAuth() ?? (await freshFrameAuth(api));
        if (!auth) {
            throw new Error(
                'Нет данных входа Битрикс24 — откройте приложение заново',
            );
        }
        setPortalSessionRefresh(async () => {
            const fresh = await freshFrameAuth(api);
            return fresh ? exchange(fresh).catch(() => null) : null;
        });
        setPortalSessionToken(await exchange(auth));
    };

    return () => {
        if (getPortalSessionToken()) return Promise.resolve();
        opening ??= open().finally(() => {
            opening = null;
        });
        return opening;
    };
};
