import type { BitrixBaseApi, BitrixServerModeEvent } from '@workspace/bitrix';
import { reportFrontError } from '@/modules/shared/front-error/report-front-error';
import { createFrameProxyTransport } from './frame-proxy-transport';
import { createPortalSessionOpener } from './portal-session';

const STORAGE_PREFIX = 'event-sales:server-mode';

/** Причина включения из памяти вкладки — без повторного отчёта. */
const RESTORED_METHOD = 'restore';

const storageKey = (domain: string, userId: string): string =>
    `${STORAGE_PREFIX}:${domain}:${userId}`;

/** В этой вкладке уже переключались — перезагрузка не возвращает отказы. */
export const isServerModeRemembered = (
    domain: string,
    userId: string,
): boolean => {
    try {
        return window.sessionStorage.getItem(storageKey(domain, userId)) === '1';
    } catch {
        return false;
    }
};

const rememberServerMode = (domain: string, userId: string): void => {
    try {
        window.sessionStorage.setItem(storageKey(domain, userId), '1');
    } catch {
        // Нет хранилища — после перезагрузки переключимся на первом отказе.
    }
};

/**
 * Подключить работу через сервер к Битриксу фрейма (решение владельца
 * 22–25.10.2026: приложение работает независимо от прав сотрудника).
 *
 * Сам режим включается в @workspace/bitrix на первом отказе «нет доступа»;
 * здесь — транспорт к бэку, память вкладки и запись в журнал фронта.
 */
export const connectBitrixServerMode = (
    api: BitrixBaseApi,
    identity: { domain: string; userId: string },
): void => {
    const { domain, userId } = identity;
    if (!domain || !userId) return;

    const transport = createFrameProxyTransport(
        { domain, requesterUserId: userId },
        createPortalSessionOpener(api),
    );

    api.serverMode.connect(transport, (event: BitrixServerModeEvent) => {
        rememberServerMode(domain, userId);
        if (event.method === RESTORED_METHOD) return;
        console.info(
            `Звонки: работаем через сервер — Битрикс24 отказал в доступе ` +
                `(${event.method}: ${event.reason})`,
        );
        reportFrontError({
            place: 'bitrix.server-mode',
            message: `Работа через сервер: ${event.method} — ${event.reason}`,
            domain,
            userId,
        });
    });

    if (isServerModeRemembered(domain, userId)) {
        api.serverMode.activate({
            method: RESTORED_METHOD,
            reason: 'в этой вкладке уже работали через сервер',
        });
    }
};
