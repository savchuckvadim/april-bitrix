'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ShareLinkDto } from '@workspace/nest-kpi-report-sales-api';
import { copyTextToClipboard } from '@/modules/shared';
import { reportLinksActions } from './report-links-slice';
import {
    buildShareUrl,
    createShareLink,
    CreateShareLinkOptions,
    fetchShareLinks,
    refreshShareLink,
    revokeShareLink,
    toggleShareLinkRefreshable,
} from './report-links-thunks';

/** Состояние и действия фичи публичных ссылок для UI-компонентов. */
export const useReportLinks = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.reportLinks);

    // execCommand-фолбэк внутри — работает и во фрейме Bitrix (в жесте клика)
    const copyUrl = useCallback(
        (token: string) => copyTextToClipboard(buildShareUrl(token)),
        [],
    );

    return {
        ...state,
        // Активные + готовящиеся (pending) — pending показываем с бейджем
        activeLinks: state.links.filter(
            l =>
                (l.status === 'active' || l.status === 'pending') &&
                !l.isExpired,
        ),
        copyUrl,
        refetch: () => dispatch(fetchShareLinks()),
        create: (options: CreateShareLinkOptions) =>
            dispatch(createShareLink(options)),
        revoke: (token: string) => dispatch(revokeShareLink(token)),
        refresh: (token: string) => dispatch(refreshShareLink(token)),
        toggleRefreshable: (link: ShareLinkDto) =>
            dispatch(toggleShareLinkRefreshable(link)),
        setManageOpen: (open: boolean) =>
            dispatch(reportLinksActions.setManageOpen(open)),
        setCreateOpen: (open: boolean) =>
            dispatch(reportLinksActions.setCreateOpen(open)),
        clearCreatedToken: () =>
            dispatch(reportLinksActions.clearCreatedToken()),
    };
};
