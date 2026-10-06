import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppStartListening } from '@/modules/app/model/store';
import { waitForAppConfig } from '@/modules/app/lib/utills/app-config-wait';
import { autoSearchDuplicates } from './DuplicatesThunk';

/**
 * Автопоиск дублей на `app/setAppData` — ТОЛЬКО при включённой настройке
 * портала «Подсказки внизу экрана» (`withActionPrompts`).
 *
 * setAppData — момент, когда известны домен и текущая сущность Битрикса.
 * Реакция «приложение загрузилось → проверить дубли» живёт listener'ом, а не
 * вложенным dispatch'ем внутри app-thunk'а (правило репо).
 *
 * Почему не на каждом открытии (владелец, 05.10.2026): фрейм открывают на
 * каждый звонок, а один автопоиск стоит бэку 3–4 запроса в Битрикс при
 * лимите 2 запроса в секунду на весь портал. Кэш бэка от похода в Битрикс
 * не избавлял — сигналы собирались до его проверки. Без настройки поиск
 * стартует, когда менеджер сам открыл блок «Возможные пересечения»
 * (см. useDuplicatesPanel).
 *
 * Настройки портала едут отдельным запросом — ждём их (до полутора секунд,
 * дальше работаем по значению из кода: поиск выключен).
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
            await waitForAppConfig(listenerApi.getState);
            if (!listenerApi.getState().app.config.withActionPrompts) return;
            await listenerApi.dispatch(autoSearchDuplicates());
        },
    });
}
