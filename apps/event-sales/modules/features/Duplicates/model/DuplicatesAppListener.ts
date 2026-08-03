import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppStartListening } from '@/modules/app/model/store';
import { autoSearchDuplicates } from './DuplicatesThunk';

/**
 * Автопоиск дублей на `app/setAppData`.
 *
 * setAppData — момент, когда известны домен и текущая сущность Битрикса.
 * Реакция «приложение загрузилось → проверить дубли» живёт listener'ом, а не
 * вложенным dispatch'ем внутри app-thunk'а (правило репо).
 *
 * Запускается при каждом открытии: клиент мог появиться в базе у другого
 * менеджера час назад. Стоит это дёшево — быстрый уровень плюс кэш ответа на
 * стороне бэкенда, так что повторные открытия портал не дёргают.
 */
export function startDuplicatesAppListener(
    startAppListening: AppStartListening,
) {
    startAppListening({
        actionCreator: appActions.setAppData,
        effect: async (_action, listenerApi) => {
            // Свежий поиск отменяет предыдущий: пока шёл первый, менеджер мог
            // переключиться на другую сущность.
            listenerApi.cancelActiveListeners();
            await listenerApi.dispatch(autoSearchDuplicates());
        },
    });
}
