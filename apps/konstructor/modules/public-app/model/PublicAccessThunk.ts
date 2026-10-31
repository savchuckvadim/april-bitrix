import {
    catalogActions,
    catalogFromInitV2,
} from '@/modules/entities/catalog';
import { fetchCompositionView } from '@/modules/features/composition-editor/model/CompositionViewThunk';
import {
    PublicLinkGoneError,
    PublicLinkHelper,
} from '../lib/api/public-link-helper';
import { publicAccessActions } from './PublicAccessSlice';
import type { PublicThunk } from './public-store';

const helper = new PublicLinkHelper();

/** Открытие ссылки: каталог и срок. Повторный вызов на ходу (StrictMode) не дублирует запросы. */
export const openPublicLink =
    (token: string): PublicThunk<Promise<void>> =>
    async (dispatch, getState) => {
        if (getState().publicAccess.status === 'loading') return;
        dispatch(publicAccessActions.opening(token));
        try {
            const [meta, init] = await Promise.all([
                helper.meta(token),
                helper.catalog(token),
            ]);
            dispatch(catalogActions.setCatalog(catalogFromInitV2(init)));
            await dispatch(fetchCompositionView());
            dispatch(publicAccessActions.opened(meta));
        } catch (error) {
            dispatch(
                error instanceof PublicLinkGoneError
                    ? publicAccessActions.linkGone()
                    : publicAccessActions.failed(),
            );
        }
    };

/**
 * Проверка уже открытой страницы: отзыв должен доходить и до открытых вкладок.
 * Закрывает только ответ «ссылка недействительна»: сбой сети не повод убирать
 * экран у человека.
 */
export const checkPublicLink =
    (): PublicThunk<Promise<void>> => async (dispatch, getState) => {
        const { token, status } = getState().publicAccess;
        if (!token || status !== 'ready') return;
        try {
            await helper.meta(token);
        } catch (error) {
            if (error instanceof PublicLinkGoneError) {
                dispatch(publicAccessActions.linkGone());
            }
        }
    };
