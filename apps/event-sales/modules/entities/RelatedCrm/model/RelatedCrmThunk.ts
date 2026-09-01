import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { RelatedCrmHelper } from '../lib/api/related-crm-helper';
import { getEntityDescriptor } from '../lib/entity-descriptor';
// Формат ключа общий с details-coverage: по нему же история узнаёт ответ
// листенера в сторе — менять только вместе.
import { buildDetailsKey } from '../lib/details-coverage';
import { relatedCrmActions } from './RelatedCrmSlice';

const helper = new RelatedCrmHelper();

export interface FetchRelatedDetailsParams {
    /** Не задан — остаётся текущее значение тумблера из состояния. */
    includeClosed?: boolean;
    /** Перезапросить даже уже загруженный ключ (кнопка «повторить»). */
    force?: boolean;
}

/**
 * Загрузка связей клиента текущего контекста встройки.
 *
 * Дедуп по ключу: тот же ключ в полёте или уже загружен — второй запрос не
 * уходит (шапка, карточка клиента и список зовут одни данные). Гонку ответов
 * решает редьюсер (latest-wins по ключу), поэтому thunk после await ничего
 * не перепроверяет.
 */
export const fetchRelatedDetails =
    ({ includeClosed, force = false }: FetchRelatedDetailsParams = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { domain } = state.app;
        const { from, company, deal, lead } = state.app.bitrix;
        const descriptor = getEntityDescriptor({ from, company, deal, lead });
        if (!domain || !descriptor) return;

        const withClosed = includeClosed ?? state.relatedCrm.includeClosed;
        const key = buildDetailsKey(
            descriptor.entityType,
            descriptor.entityId,
            withClosed,
        );
        const { key: activeKey, status } = state.relatedCrm;
        if (
            !force &&
            key === activeKey &&
            (status === 'loading' || status === 'ready')
        ) {
            return;
        }

        dispatch(
            relatedCrmActions.fetchStarted({ key, includeClosed: withClosed }),
        );
        try {
            const details = await helper.getDetails({
                domain,
                entityType: descriptor.entityType,
                entityId: descriptor.entityId,
                includeClosed: withClosed,
            });
            dispatch(relatedCrmActions.fetchSucceeded({ key, details }));
        } catch (error) {
            console.error('related crm details error', error);
            dispatch(relatedCrmActions.fetchFailed({ key }));
        }
    };
