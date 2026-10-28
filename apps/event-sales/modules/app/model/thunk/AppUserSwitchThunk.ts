import type { UnknownAction } from '@reduxjs/toolkit';
import type { AppDispatch, AppGetState } from '../store';
import { reinitApp } from './AppThunk';
import {
    getClientContext,
    getIsTmcMode,
} from '../../lib/utills/app-state-util';
import { cleanEvent } from '@/modules/processes/event/model/SendThunk';
// Прямой путь: барель режима руководителя тянет UI.
import { headModeActions } from '@/modules/features/HeadMode/model/HeadModeSlice';

/**
 * Сменить пользователя приложения («работать как» и возврат к себе).
 *
 * Порядок важен:
 *  1. форма текущего отчёта чистится — отчёт, начатый одним человеком, не
 *     должен уйти от имени другого;
 *  2. `apply` меняет, под кем стартует бут (см. app-init: resolveBootUser);
 *  3. список подчинённых гаснет — он принадлежал прежнему пользователю;
 *  4. бут заново: отдел, дела, занятость — уже под новым пользователем.
 */
export const switchAppUser =
    (apply: UnknownAction) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        await dispatch(
            cleanEvent(getIsTmcMode(state), getClientContext(state)),
        );
        dispatch(apply);
        dispatch(headModeActions.resetPerimeter());
        await dispatch(reinitApp());
    };
