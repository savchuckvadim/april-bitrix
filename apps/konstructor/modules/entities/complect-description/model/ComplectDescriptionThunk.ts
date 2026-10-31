import type { AppThunk } from '@/modules/app/model/store';
import { buildComplectDescriptionContent } from '../lib/build-description-request';
import { complectDescriptionActions } from './ComplectDescriptionSlice';

/** Запросить DOCX «Описание комплекта» по наполнению главной строки. */
export const generateComplectDescription = (): AppThunk => (dispatch, getState) => {
    const content = buildComplectDescriptionContent(getState());
    if (content) dispatch(complectDescriptionActions.requested(content));
};
