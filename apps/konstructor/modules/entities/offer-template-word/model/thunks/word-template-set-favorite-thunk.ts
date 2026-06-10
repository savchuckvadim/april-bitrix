import type { AppDispatch, AppGetState } from '@/modules/app';

import { setFavoriteUserSelectedTemplateAPI } from '../../lib';
import { wordTemplateAC } from '../WordTemplateSlice';

export const setUserFavoriteWordTemplate =
    (id: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const userId = Number(state.app.bitrix.user?.ID) || 0;
        const portalId = state.portal.current?.id;
        const isFavorite = !state.offerTemplateWord.favorites.includes(id);
        if (isFavorite) {
            dispatch(wordTemplateAC.addToFavorites(id));
        } else {
            dispatch(wordTemplateAC.removeFromFavorites(id));
        }

        if (userId && portalId && id) {
            const dto = {
                bitrix_user_id: userId,
                portal_id: portalId.toString(),
                offer_template_id: id,
            };
            await setFavoriteUserSelectedTemplateAPI(dto, isFavorite);
        }
    };
