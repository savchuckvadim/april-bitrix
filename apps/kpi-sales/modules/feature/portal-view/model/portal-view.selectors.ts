import type { RootState } from '@/modules/app/model/store';
import { selectIsViewAs, selectRealUser } from '@/modules/app/model/selectors';
import type { PortalViewState } from './portal-view-slice';
import type { PortalViewRequest } from './types';

export const selectPortalView = (state: RootState): PortalViewState =>
    state.portalView;

/**
 * Кому и от чьего имени спрашиваем: портал и РЕАЛЬНЫЙ пользователь сессии
 * (не «Смотреть как…» — как в списке разборов: бэк сверяет его с сессией
 * портала). На публичной странице или до инициализации — null.
 */
export const selectPortalViewRequest = (
    state: RootState,
): PortalViewRequest | null => {
    if (state.app.isPublic || !state.app.domain) return null;
    const userId = selectRealUser(state)?.ID;
    return userId ? { domain: state.app.domain, requesterUserId: String(userId) } : null;
};

export const selectHiddenTabs = (state: RootState): string[] =>
    state.portalView.view.tabsHidden;

export const selectChartsEnabledSetting = (state: RootState): boolean =>
    state.portalView.view.chartsEnabled;

export const selectSupportUrl = (state: RootState): string | null =>
    state.portalView.supportUrl;

/** Менять настройки может тот, кому бэк разрешил, и не в режиме «Смотреть как…». */
export const selectCanEditPortalView = (state: RootState): boolean =>
    state.portalView.canEdit && !selectIsViewAs(state);
