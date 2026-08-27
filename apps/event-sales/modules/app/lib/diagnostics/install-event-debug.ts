import type { AppStore } from '../../model/store';
import type { AppDiagnostics } from './app-diagnostics';
import { printAppDiagnostics } from './print-app-diagnostics';

declare global {
    interface Window {
        /** Стор приложения — для ручного разбора во фрейме. */
        eventStore?: AppStore;
        /** Снимок состояния в консоль по требованию. */
        eventDebug?: () => AppDiagnostics;
    }
}

/**
 * Глобальные точки входа отладки: `window.eventStore` и `window.eventDebug()`.
 *
 * `eventDebug()` печатает ту же свёрнутую группу, что и автодиагностика на
 * инициализации, и возвращает снимок объектом — чтобы во фрейме не приходилось
 * вручную ходить по `getState()`.
 */
export const installEventDebug = (store: AppStore): void => {
    if (typeof window === 'undefined') return;
    window.eventStore = store;
    window.eventDebug = () => printAppDiagnostics(store.getState());
};
