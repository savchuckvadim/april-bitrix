import { isAnyOf } from '@reduxjs/toolkit';
import type { AppGetState, AppStartListening } from '@/modules/app/model/store';
import { createSettleSignal } from '@/modules/app/lib/utills/settle-signal';
// Прямой путь до слайса: барель каталога тянет транспорт и данные.
import { questionnaireCatalogActions } from '../model/QuestionnaireCatalogSlice';

/**
 * Каталог едет одним лёгким запросом; полторы секунды — честный потолок,
 * после которого работаем на встроенном наборе (fail-open), не задерживая
 * отправку дольше.
 */
const QUESTIONNAIRE_WAIT_TIMEOUT_MS = 1500;

const signal = createSettleSignal();

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
 * Механика — подписка, а не поллинг: будит листенер на fulfilled/failed
 * каталога (startQuestionnaireCatalogSettleListener ниже); зовётся хелпер
 * из обычного thunk'а с одним getState в руках — тот же приём, что в
 * app-config-wait. Цикл — на случай ложного сигнала: всё ещё `loading` —
 * ждём дальше, но не дольше исходного дедлайна.
 */
export const waitForQuestionnaireCatalog = async (
    getState: AppGetState,
): Promise<void> => {
    const deadline = Date.now() + QUESTIONNAIRE_WAIT_TIMEOUT_MS;
    while (getState().questionnaireCatalog.status === 'loading') {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) return;
        await signal.wait(remainingMs);
    }
};

/** Разбудить ожидающих каталога (зовёт листенер ниже; в тестах — руками). */
export const notifyQuestionnaireCatalogSettled = (): void => {
    signal.notify();
};

/**
 * Будильник ожидающих: каталог доехал (fulfilled) или провалился во
 * встроенный набор (failed) — оба исхода settled, и все
 * waitForQuestionnaireCatalog отпускаются сразу, а не на ближайшем шаге
 * поллинга. Регистрируется вместе с остальными листенерами приложения.
 */
export const startQuestionnaireCatalogSettleListener = (
    startAppListening: AppStartListening,
): void => {
    startAppListening({
        matcher: isAnyOf(
            questionnaireCatalogActions.fulfilled,
            questionnaireCatalogActions.failed,
        ),
        effect: async () => {
            notifyQuestionnaireCatalogSettled();
        },
    });
};
