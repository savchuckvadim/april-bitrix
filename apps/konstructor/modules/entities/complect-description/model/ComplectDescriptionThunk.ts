import type { AppThunk } from '@/modules/app/model/store';
import { ComplectDescriptionHelper } from '../lib/api/complect-description-helper';
import { buildComplectDescriptionRequest } from '../lib/build-description-request';
import { complectDescriptionActions } from './ComplectDescriptionSlice';

const helper = new ComplectDescriptionHelper();

/** Сформировать DOCX «Описание комплекта» по наполнению главной строки. */
export const generateComplectDescription = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const request = buildComplectDescriptionRequest(getState());
    if (!request) return false;
    dispatch(complectDescriptionActions.started());
    try {
        dispatch(complectDescriptionActions.done(await helper.generate(request)));
        return true;
    } catch (error) {
        dispatch(
            complectDescriptionActions.failed(
                error instanceof Error ? error.message : 'описание комплекта не сформировано',
            ),
        );
        return false;
    }
};
