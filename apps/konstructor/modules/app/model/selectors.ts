import type { RootState } from './store';

export const selectAppDomain = (state: RootState): string => state.app.domain;

/** ID сделки из placement (или TESTING_DEAL_ID в dev) — ключ слепка вместе с domain. */
export const selectAppDealId = (state: RootState): number | null =>
    state.app.dealId;

export const selectAppInitialized = (state: RootState): boolean =>
    state.app.initialized;

export const selectAppError = (state: RootState) => state.app.error;

export const selectAppPlacement = (state: RootState) => state.app.placement;

/**
 * «Маленький экран» — вкладка карточки CRM (*_DETAIL_TAB): фрейм подгоняется
 * под окно, шапка показывает только второго участника, углы скруглены.
 */
export const selectIsSmallDisplay = (state: RootState): boolean =>
    isSmallDisplayPlacement(state.app.placement?.code);

export const isSmallDisplayPlacement = (code: string | null | undefined): boolean =>
    Boolean(code?.endsWith('_DETAIL_TAB'));
