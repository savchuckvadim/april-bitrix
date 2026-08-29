import { expirePortalCache } from '@workspace/pbx';
import type { AppStore } from '../../model/store';
import type { AppDiagnostics } from './app-diagnostics';
import { printAppDiagnostics } from './print-app-diagnostics';
import { expireAppConfigCache } from '../cache/app-config-cache';

declare global {
    interface Window {
        /** Стор приложения — для ручного разбора во фрейме. */
        eventStore?: AppStore;
        /** Снимок состояния в консоль по требованию. */
        eventDebug?: () => AppDiagnostics;
        /** Пометить кэш портала и настроек протухшим (перечитать на ⟳). */
        eventExpireCache?: () => Promise<void>;
    }
}

/**
 * Глобальные точки входа отладки: `window.eventStore`, `window.eventDebug()`
 * и `window.eventExpireCache()`.
 *
 * `eventDebug()` печатает ту же свёрнутую группу, что и автодиагностика на
 * инициализации, и возвращает снимок объектом — чтобы во фрейме не приходилось
 * вручную ходить по `getState()`.
 *
 * `eventExpireCache()` — ручной рычаг на случай «переустановили поля прямо
 * сейчас, а ⟳ до пользователя не дотянуться»: помечает браузерный кэш
 * слепка и настроек протухшим, данные при этом остаются на месте. Забирать
 * новое пойдёт ближайший старт (или та же ⟳).
 */
export const installEventDebug = (store: AppStore): void => {
    if (typeof window === 'undefined') return;
    window.eventStore = store;
    window.eventDebug = () => printAppDiagnostics(store.getState());
    window.eventExpireCache = async () => {
        const domain = store.getState().app.domain;
        if (!domain) {
            console.warn('домен ещё не известен — кэш помечать нечем');
            return;
        }
        await Promise.all([
            expirePortalCache(domain),
            expireAppConfigCache(domain),
        ]);
        console.info(`кэш ${domain} помечен протухшим — обновите карточку`);
    };
};
