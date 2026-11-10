import type { BxFrameAuth } from '@workspace/bitrix';
import {
    setPortalSessionRefresh,
    setPortalSessionToken,
} from '@workspace/nest-konstructor-api';
import {
    PortalSessionHelper,
    type PortalSessionOpenInput,
} from './api/portal-session-helper';

/**
 * Источник auth-данных фрейма — `BitrixBaseApi` из `@workspace/bitrix`:
 * вне фрейма `getFrameAuth()` отдаёт null; `refreshFrameAuth()` обновляет
 * протухший токен фрейма через родительское окно.
 */
export interface PortalSessionFrameApi {
    getFrameAuth(): BxFrameAuth | null;
    refreshFrameAuth?(): Promise<BxFrameAuth | null>;
}

const LOG_PREFIX = 'portal-session:';

const describeError = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

const toOpenInput = (auth: BxFrameAuth): PortalSessionOpenInput => ({
    domain: auth.domain,
    accessToken: auth.accessToken,
    memberId: auth.memberId ?? undefined,
});

/** Живые auth-данные фрейма: текущие, а если срок вышел — обновлённые SDK. */
const liveFrameAuth = async (
    api: PortalSessionFrameApi,
): Promise<BxFrameAuth | null> =>
    api.getFrameAuth() ??
    (api.refreshFrameAuth ? await api.refreshFrameAuth() : null);

/**
 * Сессия портала для бэка конструктора: каталог с ценами отдаётся только ей.
 * Входа для пользователя нет — фрейм уже знает, кто открыл карточку, и
 * обменивает свои auth-данные на токен молча. Токен уходит в транспорт
 * api-пакета (`Authorization: Bearer`), на 401 сессия переоткрывается
 * свежими данными фрейма.
 *
 * Вне фрейма ничего не делает (false). Ошибка обмена — предупреждение в
 * консоль и false: пока guard бэка в режиме report, запросы проходят и без
 * токена. Переоткрытие остаётся зарегистрированным — 401 даст ещё попытку.
 */
export const bootstrapPortalSession = async (
    api: PortalSessionFrameApi,
): Promise<boolean> => {
    const auth = api.getFrameAuth();
    if (!auth) return false;

    const helper = new PortalSessionHelper();
    const exchange = async (frameAuth: BxFrameAuth): Promise<string> =>
        (await helper.open(toOpenInput(frameAuth))).token;

    setPortalSessionRefresh(async () => {
        const fresh = await liveFrameAuth(api);
        if (!fresh) {
            console.warn(
                `${LOG_PREFIX} нет auth-данных фрейма — сессию не переоткрыть`,
            );
            return null;
        }
        try {
            return await exchange(fresh);
        } catch (error) {
            console.warn(
                `${LOG_PREFIX} переоткрытие сессии не удалось: ${describeError(error)}`,
            );
            return null;
        }
    });

    try {
        setPortalSessionToken(await exchange(auth));
        return true;
    } catch (error) {
        console.warn(
            `${LOG_PREFIX} обмен auth-данных фрейма не удался, запросы идут ` +
                `без токена: ${describeError(error)}`,
        );
        return false;
    }
};
