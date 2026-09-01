import type { AppGetState, AppStartListening } from '../../model/store';
import { appActions } from '../../model/slice/AppSlice';
import { createSettleSignal } from './settle-signal';

/**
 * Настройки едут одним лёгким запросом; полторы секунды — честный потолок,
 * после которого работаем по legacy-хардкоду (fail-open), не задерживая
 * первый рендер дольше.
 */
const APP_CONFIG_WAIT_TIMEOUT_MS = 1500;

const signal = createSettleSignal();

/**
 * Дождаться fetchAppConfig (портальные настройки поверх domain-config).
 *
 * Нужен потребителям, читающим конфиг к ПЕРВОМУ запросу: init-цепочка
 * диспатчит fetchAppConfig в самом начале бута и НЕ ждёт его, поэтому
 * initialEventTasks раньше уходил в Bitrix со значением из хардкода —
 * портальная настройка taskGroupId фактически не применялась.
 *
 * Механика — подписка, а не поллинг: будит листенер на setConfigFetched
 * (startAppConfigSettleListener ниже), зовётся же хелпер из обычного thunk'а,
 * у которого есть только getState — отсюда сигнал-модуль, а не
 * listenerApi.condition. Контракт прежний: уже settled — возврат мгновенный,
 * без единого таймера; не дождались — работаем по хардкоду (fail-open по
 * таймауту). Цикл — на случай ложного сигнала: состояние не settled — ждём
 * дальше, но не дольше исходного дедлайна.
 */
export const waitForAppConfig = async (
    getState: AppGetState,
): Promise<void> => {
    const deadline = Date.now() + APP_CONFIG_WAIT_TIMEOUT_MS;
    while (!getState().app.isConfigFetched) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) return;
        await signal.wait(remainingMs);
    }
};

/** Разбудить ожидающих waitForAppConfig (зовёт листенер ниже; в тестах — руками). */
export const notifyAppConfigSettled = (): void => {
    signal.notify();
};

/**
 * Будильник ожидающих: fetchAppConfig завершился — успехом или ошибкой,
 * setConfigFetched у него в finally — и все waitForAppConfig отпускаются
 * сразу, а не на ближайшем шаге поллинга. Регистрируется вместе с остальными
 * листенерами приложения (start-store-listeners).
 */
export const startAppConfigSettleListener = (
    startAppListening: AppStartListening,
): void => {
    startAppListening({
        actionCreator: appActions.setConfigFetched,
        effect: async () => {
            notifyAppConfigSettled();
        },
    });
};
