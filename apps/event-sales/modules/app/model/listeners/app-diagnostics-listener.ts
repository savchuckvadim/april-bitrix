import { isAnyOf } from '@reduxjs/toolkit';
import { reportBootMetrics } from '../../lib/diagnostics/boot-metrics';
import { printAppDiagnostics } from '../../lib/diagnostics/print-app-diagnostics';
import { appActions } from '../slice/AppSlice';
import type { AppStartListening, RootState } from '../store';

/**
 * Сколько ждём «полную картину» (портальные настройки + список дел), прежде
 * чем печатать что есть. Дольше ждать нечего: если за это время не приехало —
 * это и есть диагноз, и он должен попасть в лог.
 */
const READY_TIMEOUT_MS = 7000;

/** Картина сложилась: конфиг применён и список дел отработал. */
const isSnapshotReady = (state: RootState): boolean =>
    state.app.isConfigFetched && state.eventTask.isFetched;

/**
 * Диагностика инициализации — ОДНА свёрнутая группа в общей консоли.
 *
 * Во фрейме Битрикса до `window.eventStore` без переключения контекста
 * DevTools не добраться, а логи из iframe видны в общей консоли — поэтому
 * снимок состояния уходит туда сам, на каждый бут (включая «Обновить») и
 * ровно один раз.
 *
 * Ждём и провал инициализации (`setInitializedError`): именно там снимок
 * нужнее всего — пустой экран объясняется доменом, режимом встройки и
 * отсутствующими сущностями.
 *
 * Печатаем не сразу: часть картины (портальные настройки, число дел, прогноз
 * компании) приезжает после бута своими цепочками. Ждём их с таймаутом и
 * печатаем что есть — недождавшееся значение в логе честнее отсутствия лога.
 *
 * `cancelActiveListeners` — от дублей: «Обновить» запускает инициализацию
 * заново, и прошлое ожидание должно умереть, а не напечатать вторую группу.
 */
export function startAppDiagnosticsListener(
    startAppListening: AppStartListening,
) {
    startAppListening({
        matcher: isAnyOf(
            appActions.setInitializedSuccess,
            appActions.setInitializedError,
        ),
        effect: async (_action, listenerApi) => {
            listenerApi.cancelActiveListeners();

            if (!isSnapshotReady(listenerApi.getState())) {
                await listenerApi.condition(
                    (_nextAction, state) => isSnapshotReady(state),
                    READY_TIMEOUT_MS,
                );
            }

            const state = listenerApi.getState();
            printAppDiagnostics(state);
            // Те же фазы — метрикой. Момент выбран этот, а не
            // setInitializedSuccess: сплэш снимается ДО прихода списка дел, и
            // отчёт оттуда не знал бы главной цифры владельца — «сколько шло
            // до дел». Здесь картина уже сложилась (или истёк её таймаут),
            // и сюда же приходит провал инициализации — неполный бут
            // отправляется наравне с полным (см. boot-metrics).
            reportBootMetrics(state.app.domain);
        },
    });
}
