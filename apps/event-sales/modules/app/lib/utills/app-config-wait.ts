import type { AppGetState } from '../../model/store';

/**
 * Настройки едут одним лёгким запросом; полторы секунды — честный потолок,
 * после которого работаем по legacy-хардкоду (fail-open), не задерживая
 * первый рендер дольше.
 */
const APP_CONFIG_WAIT_TIMEOUT_MS = 1500;
const APP_CONFIG_WAIT_STEP_MS = 50;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Дождаться fetchAppConfig (портальные настройки поверх domain-config).
 *
 * Нужен потребителям, читающим конфиг к ПЕРВОМУ запросу: init-цепочка
 * диспатчит fetchAppConfig листенером на setAppData и НЕ ждёт его, поэтому
 * initialEventTasks раньше уходил в Bitrix со значением из хардкода —
 * портальная настройка taskGroupId фактически не применялась. Поллинг, а не
 * listenerApi.condition: зовётся из обычного thunk'а, у которого есть только
 * getState. Не дождались — работаем по хардкоду (fail-open по таймауту).
 */
export const waitForAppConfig = async (
    getState: AppGetState,
): Promise<void> => {
    const deadline = Date.now() + APP_CONFIG_WAIT_TIMEOUT_MS;
    while (!getState().app.isConfigFetched && Date.now() < deadline) {
        await wait(APP_CONFIG_WAIT_STEP_MS);
    }
};
