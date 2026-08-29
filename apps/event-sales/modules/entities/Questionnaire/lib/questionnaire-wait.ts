import type { AppGetState } from '@/modules/app/model/store';

/**
 * Каталог едет одним лёгким запросом; полторы секунды — честный потолок,
 * после которого работаем на встроенном наборе (fail-open), не задерживая
 * отправку дольше.
 */
const QUESTIONNAIRE_WAIT_TIMEOUT_MS = 1500;
const QUESTIONNAIRE_WAIT_STEP_MS = 50;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Дождаться каталога анкет перед решением, что спрашивать (send() и
 * валидация отправки).
 *
 * Ждём ТОЛЬКО `loading` и ТОЛЬКО до дедлайна. Всё остальное — `idle`
 * (запрос не начинали), `ready`, `error` — возвращается немедленно:
 * состояние уже settled, ждать нечего.
 *
 * Это не гейт: не дождались — работаем на встроенном наборе. Блокирующее
 * ожидание положило бы отправку отчётов на всех порталах от одного 500,
 * а каталог решает лишь, какие вопросы показать.
 *
 * Поллинг, а не `listenerApi.condition`: зовётся из обычного thunk'а, у
 * которого есть только `getState` (тот же приём, что в app-config-wait).
 */
export const waitForQuestionnaireCatalog = async (
    getState: AppGetState,
): Promise<void> => {
    const deadline = Date.now() + QUESTIONNAIRE_WAIT_TIMEOUT_MS;
    while (
        getState().questionnaireCatalog.status === 'loading' &&
        Date.now() < deadline
    ) {
        await wait(QUESTIONNAIRE_WAIT_STEP_MS);
    }
};
