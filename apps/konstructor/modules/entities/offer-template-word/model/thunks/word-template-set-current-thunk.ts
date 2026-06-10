import type { AppDispatch, AppGetState } from '@/modules/app';

import { setCurrentUserSelectedTemplateAPI } from '../../lib';
import type { WordTemplate } from '../../types';
import { wordTemplateAC } from '../WordTemplateSlice';

import { requestWordTemplatePdfPreview } from './word-template-preview-thunk';

export const setUserCurrentWordTemplateThunk =
    (template: WordTemplate | null) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const userId = Number(state.app.bitrix.user?.ID) || 0;
        const portalId = state.portal.current?.id;
        dispatch(wordTemplateAC.setCurrentTemplate(template));
        dispatch(wordTemplateAC.setSelectedTemplate(template));

        if (userId && portalId && template?.id) {
            await setCurrentUserSelectedTemplateAPI({
                bitrix_user_id: userId,
                portal_id: portalId.toString(),
                offer_template_id: template.id.toString(),
                is_current: true,
            });
        }

        dispatch(requestWordTemplatePdfPreview());
    };
