import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectClientCard } from '@/modules/entities/client-card';
import { selectClientType } from '@/modules/entities/deal';
import { buildClientTypeOptions } from '../lib/client-type-options.util';
import {
    isClientTypeDetectReady,
    isClientTypePromptVisible,
} from '../lib/client-type-prompt.util';

/** Компания, портал и реквизиты загружены: можно определять тип клиента и спрашивать о нём. */
export const selectClientTypeDetectReady = (state: RootState): boolean =>
    isClientTypeDetectReady({
        hasCompany: Boolean(state.app.bitrix.company),
        portalLoaded: state.portal.status === 'succeeded',
        rqSettled: state.bxrq.isFetched && !state.bxrq.isLoading,
    });

/** Нужно ли окно «Укажите тип клиента». */
export const selectClientTypePromptVisible = (state: RootState): boolean =>
    isClientTypePromptVisible({
        detectDone: state.clientTypePrompt.detect === 'done',
        deferred: state.clientTypePrompt.deferred,
        hasField: selectClientCard(state).clientType !== null,
        clientType: selectClientType(state),
    });

/** Варианты окна по пунктам поля «Тип клиента» компании на портале. */
export const selectClientTypePromptOptions = createSelector(
    [(state: RootState) => selectClientCard(state).clientType?.items],
    items => buildClientTypeOptions(items),
);
