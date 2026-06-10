import type { AppDispatch, AppGetState } from '@/modules/app';

import { createWordTemplateAPI } from '../../lib';
import type { CreateWordTemplateRequest, CreateWordTemplateThunkDto } from '../../types';
import { wordTemplateAC } from '../WordTemplateSlice';

export const createWordTemplateThunk =
    (data: CreateWordTemplateThunkDto, callBack?: () => void) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        try {
            const state = getState();
            const portal = state.portal.current;
            const userId = Number(state.app.bitrix.user?.ID) || 0;
            const portalId = portal?.id;

            if (state.offerTemplateWord.isLoading) {
                return;
            }

            dispatch(wordTemplateAC.setLoading(true));
            dispatch(wordTemplateAC.setError(null));

            const dto: CreateWordTemplateRequest = {
                ...data,
                portal_id: portalId || 0,
                user_id: userId,
            };
            const result = await createWordTemplateAPI(dto);
            dispatch(wordTemplateAC.addTemplate(result));
            dispatch(wordTemplateAC.setCurrentTemplate(result));
            dispatch(wordTemplateAC.setLoading(false));
            callBack?.();

            return result;
        } catch (error) {
            dispatch(
                wordTemplateAC.setError(
                    error instanceof Error ? error.message : 'Failed to create template',
                ),
            );

            console.error('Error creating word template:', error);
            throw error;
        }
    };
