import type { AppDispatch, AppGetState } from '@/modules/app';

import {
    fetchPublicWordTemplates,
    fetchWordTemplateById,
    fetchWordTemplatesByPortal,
    fetchUserWordTemplates,
} from '../../lib/word-template-api';
import type { SelectedMetaData, WordTemplate, WordTemplateSummary } from '../../types/word-template-types';
import { wordTemplateAC } from '../WordTemplateSlice';

import { requestWordTemplatePdfPreview } from './word-template-preview-thunk';

/**
 * Инициализация шаблонов Word при активации режима.
 * Загружает public / portal / user. Цепочка invoice и rememberedTemplateId — опционально, если поля есть в app.
 */
export const initializeWordTemplates = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const portal = state.portal.current;
    const userId = Number(state.app.bitrix.user?.ID) || 0;
    const portalId = portal?.id;

    if (state.offerTemplateWord.isInitialized && state.offerTemplateWord.isFetched) {
        return;
    }

    try {
        dispatch(wordTemplateAC.setLoading(true));
        dispatch(wordTemplateAC.setError(null));

        const publicTemplates = await fetchPublicWordTemplates();
        dispatch(wordTemplateAC.setPublicTemplates(publicTemplates));

        let portalTemplatesResult: WordTemplateSummary[] = [];
        if (portalId) {
            const portalTemplates = await fetchWordTemplatesByPortal({ portal_id: portalId });
            portalTemplatesResult = portalTemplates;
            dispatch(wordTemplateAC.setPortalTemplates(portalTemplates));
        }

        let userTemplatesResult: WordTemplateSummary[] = [];
        let userSelectedTemplates: SelectedMetaData[] = [];
        let userFavorites: string[] = [];
        if (userId && portalId) {
            const userTemplates = await fetchUserWordTemplates({
                user_id: userId,
                portal_id: portalId,
            });

            userTemplatesResult = userTemplates.templates || [];
            userSelectedTemplates = userTemplates.selected || [];
            userFavorites = userSelectedTemplates
                .filter(s => s.is_favorite)
                .map(s => s.template_id.toString());
            dispatch(wordTemplateAC.setUserTemplates(userTemplatesResult));
            dispatch(wordTemplateAC.setFetchedSelectedTemplates(userSelectedTemplates));
            dispatch(wordTemplateAC.setFetchedFavorites(userFavorites));
        }

        const allTemplates = [...(publicTemplates || []), ...portalTemplatesResult, ...userTemplatesResult];

        const uniqueTemplates = allTemplates.filter(
            (template, index, self) => index === self.findIndex(t => t.id === template.id),
        );

        dispatch(wordTemplateAC.setTemplates(uniqueTemplates));
        dispatch(wordTemplateAC.setInitialized(true));
        dispatch(wordTemplateAC.setFetched(true));

        const rememberedTemplateId = (getState().app as { rememberedTemplateId?: string | number | null })
            .rememberedTemplateId;
        if (rememberedTemplateId) {
            await applyRememberedTemplate(dispatch, uniqueTemplates, rememberedTemplateId);
        }

        dispatch(requestWordTemplatePdfPreview());
    } catch (error) {
        console.error('Error initializing word templates:', error);
        dispatch(
            wordTemplateAC.setError(
                error instanceof Error ? error.message : 'Failed to initialize word templates',
            ),
        );
    } finally {
        dispatch(wordTemplateAC.setLoading(false));
    }
};

const applyRememberedTemplate = async (
    dispatch: AppDispatch,
    templates: WordTemplateSummary[],
    templateId: string | number,
) => {
    let template =
        templates.find(t => Number(t.id) === Number(templateId)) || null;

    if (!template) {
        try {
            const fetched = await fetchWordTemplateById({ id: String(templateId) });
            if (fetched) {
                template = fetched;
                dispatch(wordTemplateAC.addTemplate(fetched));
            }
        } catch (error) {
            console.error('Error fetching remembered template by id:', error);
        }
    }

    if (template) {
        dispatch(wordTemplateAC.setSelectedTemplate(template));
        dispatch(wordTemplateAC.setCurrentTemplate(template as WordTemplate));
    }
};
