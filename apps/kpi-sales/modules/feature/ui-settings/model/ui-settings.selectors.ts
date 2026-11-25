import type { RootState } from '@/modules/app/model/store';

/** «Разборы звонков»: бейджи и пункты методики, добавленные в панель (id). */
export const selectCallsListExtraBadges = (state: RootState): string[] =>
    state.uiSettings.callsListExtraBadges;
