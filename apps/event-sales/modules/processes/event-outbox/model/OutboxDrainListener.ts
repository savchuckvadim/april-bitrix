import { appActions } from '@/modules/app/model/slice/AppSlice';
import type {
    AppDispatch,
    AppGetState,
    AppStartListening,
} from '@/modules/app/model/store';
// Прямой путь: наблюдатель живёт в processes/event, его барель тянет UI.
import { watchFlowOperation } from '@/modules/processes/event/model/FlowWatchThunk';
// Прямой путь: стадии финиша живут в processes/event, барель тянет UI.
import { flowStatusActions } from '@/modules/processes/event/model/FlowStatusSlice';
// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import { publishOutboxLevel } from '@/modules/shared/metrics/lib/business-metrics';

import { DIRECT_BITRIX_TARGET_ID } from '../lib/delivery-targets';
import {
    OUTBOX_ENVELOPE_KIND,
    OUTBOX_ENVELOPE_STATE,
} from '../lib/outbox-envelope';
import { outboxActions } from './OutboxSlice';
import {
    armOutboxDrainTimer,
    drainOutbox,
    type DrainOutboxOptions,
} from './OutboxDrainThunk';

/**
 * Поводы дренажа outbox (план А3): конец инициализации (fire-and-forget
 * после setInitializedSuccess), появление сети (`window 'online'`) и таймер
 * 60с. Таймер держат два конца: конец прогона перезаряжает его, пока
 * остаются недоставленные, а появление недоставленных в зеркале
 * (setUndelivered с count > 0 — его дошлёт любой пересчёт
 * refreshOutboxMirror) взводит его заново. Без второго конца конверт,
 * исчерпавший бэкофф при живой сети (лёг бэк — 'online' не случится), ждал
 * бы перезапуска фрейма вопреки обещанию финиша «уйдёт сам»; тем же таймером
 * добираются delivering-конверты брошенных наблюдателей.
 *
 * Листенер — по образцу соседей (startEventPlanAppListener и др.): повод
 * живёт здесь, а не внутри app-init, и срабатывает на ОБОИХ выходах
 * инициализации (обычном и через guard) и на каждом reload ⟳. Второй таймер
 * reload не плодит: drainOutbox гасит прежний перед перезарядкой, подписка
 * на 'online' регистрируется один раз на сессию, а взвод по setUndelivered
 * молчит при взведённом таймере и во время прогона.
 */

/**
 * Дренаж додоставляет конверт, а исход отдаёт существующий поллинг; для
 * терминального исхода из самого дренажа — синхронизация flowStatus ТЕКУЩЕЙ
 * отправки. Никакого cleanEvent/reloadApp из дренажа: фоновый прогон может
 * сработать, когда менеджер уже заполняет НОВУЮ форму, и перезагрузка
 * приложения уничтожила бы его работу — только setDone/setError + пометка
 * списка устаревшим (tasksStale), как в пути поллинга.
 */
const buildDrainOptions = (
    dispatch: AppDispatch,
    getState: AppGetState,
): DrainOutboxOptions => ({
    onAccepted: envelope => {
        // Повторный POST принят, статус ещё не терминален — исход узнаёт
        // СУЩЕСТВУЮЩИЙ поллинг статуса: done/failed погасят конверт через
        // markDelivered/markFailed. Для конверта чужой сессии наблюдатель
        // выходит сразу (operationId не совпадает с flowStatus) — такой
        // конверт погасит следующий прогон дренажа сверкой checkStatus.
        void dispatch(
            watchFlowOperation({
                operationId: envelope.operationId,
                domain: envelope.domain,
                tasksStale: envelope.kind === OUTBOX_ENVELOPE_KIND.report,
            }),
        );
    },
    onDelivered: envelope => {
        // Дренаж дослал именно ТЕКУЩУЮ отправку: менеджер может сидеть на
        // финише «сохранено, отправим автоматически» (QUEUED) — без setDone
        // баннер застыл бы навсегда, а повторная ручная отправка родила бы
        // новый operationId, то есть настоящий дубль в CRM. setDone гасит
        // QUEUED (outboxState → NONE) и помечает список устаревшим — тем же
        // tasksStale, что и путь поллинга. Конверт чужой сессии
        // (operationId не совпал) не трогаем.
        if (getState().flowStatus.operationId !== envelope.operationId) {
            return;
        }
        dispatch(
            flowStatusActions.setDone({
                tasksStale: envelope.kind === OUTBOX_ENVELOPE_KIND.report,
            }),
        );
    },
    onFailedTerminal: (envelope, detail) => {
        // Бэкенд отверг именно ТЕКУЩУЮ отправку — финиш обязан показать
        // честную ошибку с «Повторить», а не вечное «отправим автоматически».
        if (getState().flowStatus.operationId !== envelope.operationId) {
            return;
        }
        dispatch(
            flowStatusActions.setError({
                message:
                    detail ||
                    'Отправка не удалась. Данные никуда не делись — можно повторить.',
            }),
        );
    },
    onExecutedDirect: (envelope, summary) => {
        // Дренаж исполнил ТЕКУЩУЮ отправку напрямую (А4): бэк молчал, ядро
        // выполнено прямо в Битриксе — та же честная смена стадии, что у
        // onDelivered (DONE), при непустом хвосте — плюс PARTIAL («часть
        // доедет позже»). Никакого cleanEvent/reloadApp — прогон фоновый,
        // менеджер может заполнять новую форму. Конверт чужой сессии
        // (operationId не совпал) не трогаем — его стадию никто не смотрит.
        if (getState().flowStatus.operationId !== envelope.operationId) {
            return;
        }
        dispatch(
            flowStatusActions.setDeliveryTarget({
                target: DIRECT_BITRIX_TARGET_ID,
            }),
        );
        dispatch(
            flowStatusActions.setDone({
                tasksStale: envelope.kind === OUTBOX_ENVELOPE_KIND.report,
            }),
        );
        if (summary.envelopeState === OUTBOX_ENVELOPE_STATE.partial) {
            // Порядок важен: setDone сбрасывает outboxState в NONE.
            dispatch(flowStatusActions.setOutboxPartial());
        }
    },
    onTailDelivered: envelope => {
        // Хвост ТЕКУЩЕЙ отправки доехал (А5): служебная часть проведена, и
        // пометка «не проведена» с финиша обязана уйти. setDone сбрасывает
        // outboxState в NONE — этого достаточно; стадия остаётся DONE, а
        // deliveryTarget (прямой путь) в сторе не трогаем: он диагностика.
        if (getState().flowStatus.operationId !== envelope.operationId) {
            return;
        }
        dispatch(
            flowStatusActions.setDone({
                tasksStale: envelope.kind === OUTBOX_ENVELOPE_KIND.report,
            }),
        );
    },
    onDirectIncomplete: (envelope, summary) => {
        // Дренаж провёл ТЕКУЩУЮ отправку напрямую, но НЕ ЦЕЛИКОМ: часть
        // обязательных команд не применилась, доисполнить их нечем.
        // Интерфейсу нельзя говорить «отчёт проведён» — стадия
        // DONE+INCOMPLETE. Конверт чужой сессии не трогаем, как и выше.
        if (getState().flowStatus.operationId !== envelope.operationId) {
            return;
        }
        console.error(
            '[event-outbox] дренаж: отчёт проведён не целиком',
            summary.failedCommands.join(', '),
        );
        dispatch(
            flowStatusActions.setDeliveryTarget({
                target: DIRECT_BITRIX_TARGET_ID,
            }),
        );
        dispatch(
            flowStatusActions.setDone({
                tasksStale: envelope.kind === OUTBOX_ENVELOPE_KIND.report,
            }),
        );
        // Порядок важен: setDone сбрасывает outboxState в NONE.
        dispatch(flowStatusActions.setOutboxIncomplete());
    },
});

let onlineRegistered = false;

/** Сброс сессионной подписки 'online' — для тестов. */
export const resetOutboxOnlineDrainForTests = (): void => {
    onlineRegistered = false;
};

/**
 * Подписка на `window 'online'` — один раз на сессию: браузер снова в сети,
 * самое время дослать недоставленное, не дожидаясь таймера.
 */
export const registerOutboxOnlineDrain = (
    dispatch: AppDispatch,
    getState: AppGetState,
): void => {
    if (onlineRegistered || typeof window === 'undefined') {
        return;
    }
    if (typeof window.addEventListener !== 'function') {
        return;
    }
    onlineRegistered = true;
    window.addEventListener('online', () => {
        void dispatch(drainOutbox(buildDrainOptions(dispatch, getState)));
    });
};

export function startOutboxDrainListener(startAppListening: AppStartListening) {
    startAppListening({
        actionCreator: appActions.setInitializedSuccess,
        effect: async (_action, listenerApi) => {
            const { dispatch, getState } = listenerApi;

            // Fire-and-forget: бут дренаж не ждёт, сплэш уже снят.
            void dispatch(drainOutbox(buildDrainOptions(dispatch, getState)));
            registerOutboxOnlineDrain(dispatch, getState);
        },
    });

    // Недоставленные появились — взводим таймер, не дожидаясь прогона:
    // setUndelivered дошлёт любой пересчёт зеркала, в том числе финальный
    // пересчёт enqueueAndDeliver после исчерпанного бэкоффа (exhausted).
    startAppListening({
        actionCreator: outboxActions.setUndelivered,
        effect: async (action, listenerApi) => {
            const { dispatch, getState } = listenerApi;

            if (action.payload.count > 0) {
                armOutboxDrainTimer(
                    dispatch,
                    buildDrainOptions(dispatch, getState),
                );
            }
        },
    });

    // СКОЛЬКО ЛЕЖИТ НЕДОСТАВЛЕННЫМИ — метрикой, из ЕДИНСТВЕННОЙ точки
    // публикации зеркала: и пересчёт после каждой отправки
    // (refreshOutboxMirror), и итог прогона дренажа приходят одним и тем же
    // `setUndelivered`. Отдельным листенером, а не строкой в соседнем: там
    // повод дренажа, здесь диагностика — смешивать их значило бы, что
    // выключение одного молча гасит другое.
    startAppListening({
        actionCreator: outboxActions.setUndelivered,
        effect: async action => {
            publishOutboxLevel({
                domain: action.payload.domain,
                undelivered: action.payload.count,
                partial: action.payload.partialCount ?? 0,
                incomplete: action.payload.incompleteCount ?? 0,
            });
        },
    });
}
