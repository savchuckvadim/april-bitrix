import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
// прямые пути, мимо баррелей: слушатель живёт в оболочке и не должен тянуть за собой UI сущностей
import { updateClientChoice } from '@/modules/entities/client-card/model/ClientCardThunk';
import { detectClientTypeByBundle } from '@/modules/entities/bx-rq/lib/detect-client-type.util';
import { bxrqActions } from '@/modules/entities/bx-rq/model/BxRqSlice';
import { getClientTypeItemCode } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { selectClientType } from '@/modules/entities/deal/lib/utils/select-client-type.util';
import { initPortal } from '@/modules/entities/portal/model/PortalThunk';
import { clientTypePromptActions } from '@/modules/features/client-type-prompt/model/ClientTypePromptSlice';
import { selectClientTypeDetectReady } from '@/modules/features/client-type-prompt/model/selectors';
import type { AppDispatch, RootState } from '../store';

/**
 * Реквизиты компании пришли (или не загрузились) или слепок портала загружен →
 * один раз за загрузку сделки определить тип клиента по реквизитам. Тип не
 * задан ни в компании, ни в сделке, и все реквизиты компании одного типа:
 * тип записывается в `op_client_type` тем же thunk'ом, что и чип в шапке.
 * Реквизитов нет или их типы разные — ничего не пишем, вопрос о типе клиента
 * зададит окно «Укажите тип клиента», когда попытка завершится.
 *
 * Метка «идёт» ставится до первого await: три источника события (реквизиты,
 * ошибка загрузки, портал) не запускают запись повторно.
 */
export function setupClientTypeDetectListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
        matcher: isAnyOf(
            bxrqActions.setFetched,
            bxrqActions.setFetchedStatus,
            initPortal.fulfilled,
        ),
        effect: async (_action, listenerApi) => {
            const state = listenerApi.getState();
            if (state.clientTypePrompt.detect !== 'idle') return;
            if (!selectClientTypeDetectReady(state)) return;

            listenerApi.dispatch(clientTypePromptActions.detectStarted());
            try {
                if (selectClientType(state) !== null) return;
                const detected = detectClientTypeByBundle(state.bxrq.rqs);
                if (!detected) return;
                await listenerApi.dispatch(
                    updateClientChoice(
                        'clientType',
                        getClientTypeItemCode(detected),
                        { syncInn: false },
                    ),
                );
            } finally {
                listenerApi.dispatch(clientTypePromptActions.detectFinished());
            }
        },
    });
}
