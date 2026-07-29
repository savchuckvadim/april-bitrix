import type { RootState } from './store';

export const selectAppDomain = (state: RootState): string => state.app.domain;

/** ID сделки из placement (или TESTING_DEAL_ID в dev) — ключ слепка вместе с domain. */
export const selectAppDealId = (state: RootState): number | null =>
    state.app.dealId;

export const selectAppInitialized = (state: RootState): boolean =>
    state.app.initialized;

export const selectAppError = (state: RootState) => state.app.error;
