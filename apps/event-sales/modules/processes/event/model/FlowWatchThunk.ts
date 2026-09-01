import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { FlowHelper } from '../lib/api/flow-helper';
// Прямой путь в слайс outbox: барель тянет дренаж (правило store).
import {
    markDelivered,
    markFailed,
} from '@/modules/processes/event-outbox/model/OutboxThunk';
import {
    FLOW_POLL_INTERVAL_MS,
    FLOW_POLL_TIMEOUT_MESSAGE,
    FLOW_POLL_TIMEOUT_MS,
} from '../lib/flow-watch';
import { EV_FLOW_OPERATION_STATUS, EvFlowOperation } from './index';
import { flowStatusActions } from './FlowStatusSlice';

const flowHelper = new FlowHelper();

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface WatchFlowOperationOptions {
    operationId: string;
    domain: string;
    /** Нужна ли перезагрузка списка событий по завершении. */
    tasksStale: boolean;
    /** Что сделать после успеха — например, почистить форму отчёта. */
    onDone?: () => void;
}

/**
 * Ждём исход операции отправки, опрашивая её статус.
 *
 * Наблюдение живёт ровно столько, сколько открыт фрейм: если менеджер уйдёт,
 * ничего страшного не произойдёт — операция всё равно выполняется на бэкенде,
 * а её статус живёт час и доступен по тому же id. Поэтому здесь нет попыток
 * пережить перезагрузку: список при следующем открытии покажет факт.
 */
export const watchFlowOperation =
    ({ operationId, domain, tasksStale, onDone }: WatchFlowOperationOptions) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const deadline = Date.now() + FLOW_POLL_TIMEOUT_MS;

        while (Date.now() < deadline) {
            // Пользователь начал новую отправку — эта уже не актуальна.
            if (getState().flowStatus.operationId !== operationId) return;

            let operation: EvFlowOperation;
            try {
                operation = await flowHelper.getFlowStatus(operationId, domain);
            } catch (error) {
                // Сеть моргнула или статус ещё не доехал до реплики — не
                // объявляем провал, у нас есть запас времени до дедлайна.
                console.warn('flow status poll failed', error);
                await wait(FLOW_POLL_INTERVAL_MS);
                continue;
            }

            if (operation.status === EV_FLOW_OPERATION_STATUS.done) {
                dispatch(flowStatusActions.setDone({ tasksStale }));
                // Конверт outbox гасится ЭТИМ ЖЕ поллингом — других каналов
                // подтверждения у отправки нет. Гасим до onDone: тот
                // перезапускает init, и конверт должен быть уже погашен.
                await dispatch(markDelivered(operationId));
                onDone?.();
                return;
            }

            if (operation.status === EV_FLOW_OPERATION_STATUS.failed) {
                dispatch(
                    flowStatusActions.setError({
                        message:
                            operation.error ||
                            'Отправка не удалась. Данные никуда не делись — можно повторить.',
                    }),
                );
                // Провал от САМОГО бэка — payload он получил и отверг:
                // авторетраев конверту не положено (rejected-попытка).
                await dispatch(
                    markFailed(
                        operationId,
                        operation.error || 'бэкенд сообщил об ошибке flow',
                    ),
                );
                return;
            }

            await wait(FLOW_POLL_INTERVAL_MS);
        }

        // Таймаут поллинга — НЕ приговор конверту: доставка принята, исход
        // неизвестен. Конверт остаётся `delivering`; когда lease протухнет,
        // дренаж сам сверится со статусом (checkStatus) и погасит его.
        dispatch(
            flowStatusActions.setError({ message: FLOW_POLL_TIMEOUT_MESSAGE }),
        );
    };
