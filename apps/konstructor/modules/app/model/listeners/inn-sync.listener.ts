import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
// прямые пути, мимо баррелей: слушатель живёт в оболочке и не должен тянуть за собой UI сущностей
import { bxrqActions } from '@/modules/entities/bx-rq/model/BxRqSlice';
import { syncCurrentInn } from '@/modules/entities/client-inn/model/InnSyncThunk';
import type { AppDispatch, RootState } from '../store';

/**
 * Менеджер выбрал другой реквизит или сохранил реквизит (новый или с
 * исправленным ИНН) → ИНН этого реквизита становится текущим ИНН сделки и
 * компании и входит в их пул. Шапка от записи не зависит: она показывает ИНН
 * текущего реквизита сразу.
 *
 * Загрузка сделки, восстановление слепка и пересчёт реквизитов по типу
 * клиента сюда не попадают: открытие сделки ничего не пишет. Смену типа
 * клиента в шапке подхватывает `updateClientChoice` после записи типа.
 */
export function setupInnSyncListener(listenerMiddleware: ListenerMiddlewareInstance) {
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
        matcher: isAnyOf(bxrqActions.setCurrentItem, bxrqActions.saveBaseCreating),
        effect: async (_action, listenerApi) => {
            await listenerApi.dispatch(syncCurrentInn());
        },
    });
}
