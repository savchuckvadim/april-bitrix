import type { BxFrameAuth } from '@workspace/bitrix';
import {
    setPortalSessionRefresh,
    setPortalSessionToken,
} from '@workspace/nest-kpi-report-sales-api';
import {
    PortalSessionHelper,
    type PortalSessionOpenInput,
} from './api/portal-session-helper';

/**
 * Источник auth-данных фрейма — `BitrixBaseApi` из `@workspace/bitrix`:
 * вне фрейма `getFrameAuth()` отдаёт null; `refreshFrameAuth()` (если есть)
 * обновляет протухший токен фрейма через родительское окно.
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
 * Открыть portal-context сессию kpi-report-sales из фрейма Bitrix24:
 * обменять auth-данные фрейма на JWT, положить его в транспорт api-пакета
 * (`Authorization: Bearer` на все запросы) и зарегистрировать переоткрытие
 * на 401 — повторный обмен уже свежими auth-данными фрейма.
 *
 * Вне фрейма ничего не делает (false). Ошибка обмена — предупреждение в
 * консоль и false: fail-open, пока guard бэка в режиме report. Переоткрытие
 * при этом остаётся зарегистрированным — 401 позже даст ещё одну попытку.
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
                `без токена (guard бэка в режиме report): ${describeError(error)}`,
        );
        return false;
    }
};
