import type { AppDispatch, AppGetState } from '@/modules/app';

import { deleteWordTemplateAPI, fetchWordTemplateById } from '../../lib';
import type { WordTemplate, WordTemplateIdParams } from '../../types';
import { wordTemplateAC } from '../WordTemplateSlice';

import { setUserCurrentWordTemplateThunk } from './word-template-set-current-thunk';

export const deleteWordTemplateThunk =
    (params: WordTemplateIdParams) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const app = state.app;
        const currentTemplate = state.offerTemplateWord.currentTemplate;
        const isDeleting = state.offerTemplateWord.isDeleting;
        const isSuperUser = Boolean((app as { isSuperUser?: boolean }).isSuperUser);
        if (isDeleting) {
            return;
        }
        dispatch(wordTemplateAC.setDeleting(params.id));

        try {
            dispatch(wordTemplateAC.setError(null));
            await deleteWordTemplateAPI(params, isSuperUser);
            dispatch(wordTemplateAC.deleteTemplate(params.id));
            if (currentTemplate?.id === params.id) {
                const portalTemplates = state.offerTemplateWord.portalTemplates;
                const publicTemplates = state.offerTemplateWord.publicTemplates;
                const nextCurrentTemplateSummary =
                    portalTemplates.find(t => t.is_default) || publicTemplates.find(t => t.is_default) || null;
                const nextCurrentId = nextCurrentTemplateSummary?.id || null;

                let nextCurrentTemplate: WordTemplate | null = null;
                if (nextCurrentId) {
                    nextCurrentTemplate = await fetchWordTemplateById({ id: nextCurrentId.toString() });
                }

                dispatch(setUserCurrentWordTemplateThunk(nextCurrentTemplate));
            }
            return true;
        } catch (err) {
            dispatch(
                wordTemplateAC.setError(
                    err instanceof Error ? err.message : 'Failed to delete template',
                ),
            );
            throw err;
        } finally {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch(wordTemplateAC.setDeleting(false));
        }
    };
