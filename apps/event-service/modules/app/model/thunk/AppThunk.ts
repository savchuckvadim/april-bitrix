import {
    DEV_CURRENT_USER_ID,
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from '../../consts/app-global';
import { appActions } from '../slice/AppSlice';
import { getDisplayMode, getEntitiesFromPlacement } from '../../lib/utills/placement-util';
import { initAppEntities, initAppTask } from '../../lib/utills/app-setup-util';
import { portalAPI } from '@workspace/pbx';
import { AppDispatch, AppGetState } from '../store';
import { Bitrix } from '@workspace/bitrix';
import { BXTask, BXUser, Placement } from '@workspace/bx';
import { setDepartmentMode, getDepartment } from '@/modules/features/Departament/model/DepartmentThunk';

export const initial = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    if (state.app.isLoading || state.app.initialized) return;

    dispatch(appActions.isLoading({ status: true }));

    try {
        // Boot the Bitrix SDK (domain/user/placement) — non-frame envs fall back to testing data.
        const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
        await bitrix.api.getFit();

        const auth = bitrix.api.getInitializedData();
        const domain = auth.domain || TESTING_DOMAIN;
        const user = (auth.user ?? TESTING_USER) as unknown as BXUser;
        const placement = (bitrix.api.getPlacement() ?? TESTING_PLACEMENT) as Placement;

        // Determine the department mode (sales / service / tmc) from the user.
        dispatch(setDepartmentMode(user));

        // Resolve the CRM entities for the current placement via @workspace/bitrix services.
        const entities = await getEntitiesFromPlacement(placement, domain);
        const display = getDisplayMode(placement);

        if (entities.currentCompany || entities.currentLead) {
            initAppEntities(dispatch, entities, domain, user, placement, display);

            const dep = getState().app.department;
            const userId = Number((user as any)?.ID || DEV_CURRENT_USER_ID);
            const companyId = Number(
                entities.currentCompany?.ID || entities.companyPlacement.options.ID || 0,
            );

            initAppTask(
                dispatch,
                entities.currentTask as unknown as BXTask | null,
                domain,
                userId,
                companyId,
                dep,
            );

            dispatch(getDepartment(domain, user));
            dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
            dispatch(appActions.setInitializedSuccess({}));
        } else {
            dispatch(appActions.setInitializedError({ errorMessage: 'Компания не найдена' }));
        }
    } catch (error) {
        console.error('app init error', error);
        dispatch(appActions.setInitializedError({ errorMessage: 'Ошибка инициализации приложения' }));
    } finally {
        dispatch(appActions.isLoading({ status: false }));
    }
};

export const reloadApp = () => async (dispatch: AppDispatch) => {
    // Reset the app shell; `useApp` re-runs `initial()` once `initialized` is false.
    dispatch(appActions.reload());
};
