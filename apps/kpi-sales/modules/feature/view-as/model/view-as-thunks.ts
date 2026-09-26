import type { BXUser } from '@workspace/bx';
import { appActions } from '@/modules/app/model/AppSlice';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { selectAccessContext } from '@/modules/app/lib/access/use-access';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import { getDepartmentStructure } from '@/modules/entities/department/model/department-thunk';

/**
 * Режим «Смотреть как…» (только реальный суперпользователь вендора —
 * правило VIEW_AS в shared/access, флаг бэка currentUser.isSuperUser).
 *
 * Механика: подменяется ТОЛЬКО app.viewAs.user (bitrix.user остаётся
 * реальным), затем перезапрашивается структура от имени просматриваемого —
 * существующая listener-цепочка (setStructure → сохранённый фильтр →
 * отчёт + звонки) перезагружает всё остальное сама. setAppData НЕ
 * диспатчится — app-init листенеры (ui-settings hydrate, WS и т.п.)
 * не срабатывают.
 *
 * Защита от перезаписи чужого состояния — гарды по app.viewAs.user:
 * ui-settings-sync (identity → null), saveFilter (ранний return),
 * кнопки SaveFilter/ShareLinksControl скрыты в хедере.
 */
export const activateViewAs =
    (user: BXUser) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        // Только реальный суперпользователь (центральное правило VIEW_AS).
        if (!checkAccess(EAccessFeature.VIEW_AS, selectAccessContext(state))) {
            return;
        }
        const realUser = state.app.bitrix.user;
        if (String(user.ID) === String(realUser?.ID)) return; // сам на себя — no-op

        dispatch(appActions.setViewAsUser(user));
        await dispatch(getDepartmentStructure());
    };

export const deactivateViewAs =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        if (!getState().app.viewAs.user) return;
        dispatch(appActions.setViewAsUser(null));
        // Возврат к собственной роли: полная перезагрузка цепочки
        await dispatch(getDepartmentStructure());
    };
