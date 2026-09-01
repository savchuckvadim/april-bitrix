import { isAnyOf } from '@reduxjs/toolkit';
import type { AppGetState, AppStartListening } from '@/modules/app/model/store';
import { createSettleSignal } from '@/modules/app/lib/utills/settle-signal';
import { relatedCrmActions } from '../model/RelatedCrmSlice';
import type { EntityDescriptor } from './entity-descriptor';
import { isFullGraphDetailsInFlight } from './details-coverage';

/**
 * Потолок ожидания — страховка от потерянного сигнала, а не норма: обычно
 * запрос листенера завершается за секунды (бэк с withRetry укладывается в
 * ~1.2с пауз плюс сами попытки). Не дождались — история дозапросит сама
 * (fail-open), продублировав запрос лишь в аномальном сценарии.
 */
const RELATED_DETAILS_WAIT_TIMEOUT_MS = 15_000;

const signal = createSettleSignal();

/**
 * Дождаться, пока УЖЕ ЛЕТЯЩИЙ запрос полного графа связей (листенер
 * RelatedCrm, includeClosed:true) завершится — чтобы история переиспользовала
 * его ответ, а не слала второй такой же `/duplicates/details`.
 *
 * Ждём ТОЛЬКО пока в полёте запрос, покрывающий текущий контекст: сменился
 * ключ (контекст переключили на лету) или статус — возврат немедленный,
 * «дождались ли» вызывающий решает сам по стору. Механика — подписка, а не
 * поллинг: будит листенер ниже; зовётся из обычного thunk'а, у которого в
 * руках только getState (паттерн app-config-wait).
 */
export const waitForRelatedDetailsSettled = async (
    getState: AppGetState,
    descriptor: EntityDescriptor,
): Promise<void> => {
    const deadline = Date.now() + RELATED_DETAILS_WAIT_TIMEOUT_MS;
    while (isFullGraphDetailsInFlight(getState().relatedCrm, descriptor)) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) return;
        await signal.wait(remainingMs);
    }
};

/** Разбудить ожидающих (зовёт листенер ниже; в тестах — руками). */
export const notifyRelatedDetailsSettled = (): void => {
    signal.notify();
};

/**
 * Будильник ожидающих: запрос связей завершился (успехом или ошибкой) либо
 * ⟳ сбросил слайс — все waitForRelatedDetailsSettled отпускаются сразу и
 * перечитывают стор, а не спят до дедлайна. Регистрируется вместе с
 * остальными листенерами приложения (start-store-listeners).
 */
export const startRelatedCrmSettleListener = (
    startAppListening: AppStartListening,
): void => {
    startAppListening({
        matcher: isAnyOf(
            relatedCrmActions.fetchSucceeded,
            relatedCrmActions.fetchFailed,
            relatedCrmActions.reset,
        ),
        effect: async () => {
            notifyRelatedDetailsSettled();
        },
    });
};
