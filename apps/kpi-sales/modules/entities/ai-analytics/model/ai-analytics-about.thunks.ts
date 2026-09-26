import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import type { AiAboutEndpoint } from './index';
import { aiAnalyticsActions } from './ai-analytics-slice';
import {
    aiErrorMessage,
    aiHelper,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Блок «Как считаем» (about): тексты ручки, параметры реестра с действующими
 * значениями и модель портала. Кэш в сторе по ручке — повторно не
 * запрашиваем, пока секция ready (force — перечитать).
 */

export const AI_ABOUT_ERROR_MESSAGE = 'Блок «Как считаем» недоступен';

/** «Как считаем» для ручки витрины (overview | plan/daily | brief | manager/style). */
export const fetchAiAbout =
    (endpoint: AiAboutEndpoint, force = false) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const requester = selectAiRequester(getState());
        if (!requester) return;

        const requestKey = buildAiRequestKey({
            ...requester,
            extra: ['about', endpoint],
        });
        const current = getState().aiAnalytics.about[endpoint];
        if (current?.requestKey === requestKey) {
            if (current.status === 'loading') return;
            if (current.status === 'ready' && !force) return;
        }

        dispatch(aiAnalyticsActions.aboutPending({ endpoint, requestKey }));
        try {
            const response = await aiHelper.getAbout(requester, endpoint);
            if (response.status !== 'ready' || !response.data) {
                throw new Error(response.message || AI_ABOUT_ERROR_MESSAGE);
            }
            dispatch(
                aiAnalyticsActions.aboutReady({
                    endpoint,
                    data: response.data,
                    requestKey,
                    serverKey: response.requestKey,
                }),
            );
        } catch (error) {
            dispatch(
                aiAnalyticsActions.aboutFailed({
                    endpoint,
                    requestKey,
                    error: aiErrorMessage(error, AI_ABOUT_ERROR_MESSAGE),
                }),
            );
        }
    };
