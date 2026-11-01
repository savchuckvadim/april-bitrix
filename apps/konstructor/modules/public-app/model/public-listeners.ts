import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { complectDescriptionActions } from '@/modules/entities/complect-description';
import {
    setupAcademyTermListener,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';
import {
    PublicLinkGoneError,
    PublicLinkHelper,
} from '../lib/api/public-link-helper';
import { replaceDescriptionUrl } from '../lib/description-url.util';
import { publicAccessActions } from './PublicAccessSlice';
import type { PublicDispatch, PublicState } from './public-store';

const helper = new PublicLinkHelper();

/**
 * Запрошено описание комплекта → файл приходит по токену и остаётся в памяти
 * вкладки; ссылка под кнопкой ведёт на него.
 */
function setupPublicDescriptionListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening.withTypes<PublicState, PublicDispatch>()({
        actionCreator: complectDescriptionActions.requested,
        effect: async (action, listenerApi) => {
            const { token } = listenerApi.getState().publicAccess;
            if (!token) return;
            try {
                const file = await helper.description(token, action.payload);
                listenerApi.dispatch(
                    complectDescriptionActions.done({
                        link: replaceDescriptionUrl(file.blob),
                        documentName: file.documentName,
                        infoblocksCount: 0,
                    }),
                );
            } catch (error) {
                if (error instanceof PublicLinkGoneError) {
                    listenerApi.dispatch(publicAccessActions.linkGone());
                    return;
                }
                listenerApi.dispatch(
                    complectDescriptionActions.failed(
                        error instanceof Error
                            ? error.message
                            : 'описание комплекта не сформировано',
                    ),
                );
            }
        },
    });
}

/** Реакции публичного стора: сборка та же, что во фрейме, описание — по токену. */
export function startPublicListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupRowSetSyncListener(listenerMiddleware);
    setupAcademyTermListener(listenerMiddleware);
    setupPublicDescriptionListener(listenerMiddleware);
}
