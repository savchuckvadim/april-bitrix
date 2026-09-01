import type { RootState } from '../../model/store';
import {
    buildAppDiagnostics,
    formatAppDiagnostics,
    type AppDiagnostics,
} from './app-diagnostics';
import { formatBootPhases, readBootPhases } from './boot-phases';

/** Заголовок группы — по нему диагностику находят в общей консоли портала. */
export const DIAGNOSTICS_TITLE = '[event-sales] диагностика';

/**
 * Печать снимка ОДНОЙ свёрнутой группой.
 *
 * Во фрейме Битрикса до `window.eventStore` без переключения контекста
 * DevTools не добраться, а на проде это единственный способ понять состояние.
 * Логи из iframe при этом видны в ОБЩЕЙ консоли — поэтому диагностика уходит
 * туда, а не в стор: свернутая группа не шумит, но всегда под рукой.
 *
 * Возвращает снимок — им пользуется `window.eventDebug()`.
 */
export const printAppDiagnostics = (state: RootState): AppDiagnostics => {
    const diagnostics = buildAppDiagnostics(state);

    console.groupCollapsed(DIAGNOSTICS_TITLE);
    for (const line of formatAppDiagnostics(diagnostics)) {
        console.info(line);
    }
    // Фазы бута: где именно потратилось время первой загрузки.
    console.info(`фазы бута: ${formatBootPhases(readBootPhases())}`);
    console.groupEnd();

    return diagnostics;
};
