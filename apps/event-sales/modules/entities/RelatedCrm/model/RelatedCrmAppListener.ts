import { isAnyOf } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppStartListening } from '@/modules/app/model/store';
import { fetchRelatedDetails } from './RelatedCrmThunk';

/**
 * Связи клиента при смене контекста сущности — ТОЛЬКО если их уже кто-то
 * запрашивал.
 *
 * Раньше граф грузился здесь на каждое открытие фрейма (`setAppData`). Это
 * 8–9 запросов бэка в Битрикс без кэша, а фрейм открывают на каждый звонок —
 * при лимите портала 2 запроса в секунду связи одних менеджеров душили
 * отчёты других (разбор 05.10.2026). Теперь граф запрашивает тот, кому он
 * реально понадобился: история, контакты, выбор заявки для новой задачи
 * (см. `useEnsureRelations` и `ensureRelatedDetails`).
 *
 * Здесь осталась одна обязанность: контекст сменился на лету
 * (`setAppBitrixData` — компанию привязали к сделке из виджета), а граф для
 * прежнего контекста уже был на экране — перезапросить под новый ключ.
 * Никто не просил (`idle`) — молчим: попросят — загрузится.
 *
 * Грузим ПОЛНЫЙ граф (includeClosed:true): открытость каждой сделки
 * приходит флагом `closed`, и потребители открытого списка фильтруют её
 * сами; истории закрытые нужны — их ленты самая ценная часть архива.
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
            if (listenerApi.getState().relatedCrm.status === 'idle') return;
            await listenerApi.dispatch(
                fetchRelatedDetails({ includeClosed: true }),
            );
        },
    });
}
