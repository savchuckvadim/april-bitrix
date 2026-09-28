import type { AppGetState } from '@/modules/app/model/store';
import { createSettleSignal } from '@/modules/app/lib/utills/settle-signal';

/**
 * Список подчинённых едет одним запросом, структура на бэке закэширована.
 * Не дождались — показываем только свои дела (fail-open), а когда список
 * приедет, дела сотрудников доедут перезапросом (см. HeadModeListener).
 */
const HEAD_PERIMETER_WAIT_TIMEOUT_MS = 2500;

const signal = createSettleSignal();

/**
 * Дождаться списка подчинённых перед первым запросом дел: иначе список
 * уходил бы в Битрикс только со своим id, и руководитель видел бы дела
 * сотрудников лишь после ручного обновления.
 */
export const waitForHeadPerimeter = async (
    getState: AppGetState,
): Promise<void> => {
    const deadline = Date.now() + HEAD_PERIMETER_WAIT_TIMEOUT_MS;
    const isSettled = (): boolean => {
        const { status } = getState().headMode;
        return status === 'ready' || status === 'error';
    };
    while (!isSettled()) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) return;
        await signal.wait(remainingMs);
    }
};

/** Разбудить ожидающих (зовёт листенер режима; в тестах — руками). */
export const notifyHeadPerimeterSettled = (): void => {
    signal.notify();
};
