import { isAnyOf } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppStartListening } from '@/modules/app/model/store';
import { fetchRelatedDetails } from './RelatedCrmThunk';

/**
 * Связи клиента — в стор при появлении контекста сущности.
 *
 * `setAppData` — бут (домен и сущность Битрикса известны), `setAppBitrixData` —
 * контекст сменился на лету (компанию привязали к сделке из виджета): ключ
 * запроса меняется, и дедуп в thunk'е второй раз тот же контекст не грузит.
 * Шапка-layout читает связи на всех экранах, поэтому загрузка живёт здесь,
 * а не в маунте компонента.
 */
export function startRelatedCrmAppListener(
    startAppListening: AppStartListening,
) {
    startAppListening({
        matcher: isAnyOf(appActions.setAppData, appActions.setAppBitrixData),
        effect: async (_action, listenerApi) => {
            // Свежий контекст отменяет предыдущую загрузку: менеджер мог
            // сменить сущность, пока шёл первый запрос.
            listenerApi.cancelActiveListeners();
            await listenerApi.dispatch(fetchRelatedDetails());
        },
    });
}
