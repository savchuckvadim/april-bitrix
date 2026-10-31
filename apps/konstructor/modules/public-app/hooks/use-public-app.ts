'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { publicFlowSurface } from '../lib/public-flow';
import { selectPublicAccess } from '../model/PublicAccessSlice';
import { openPublicLink } from '../model/PublicAccessThunk';
import type { PublicDispatch } from '../model/public-store';
import { usePublicLinkWatch } from './use-public-link-watch';

/** Гейт публичной версии: открыть ссылку, следить за отзывом, отдать состояние экрану. */
export const usePublicApp = (token: string) => {
    const dispatch = useDispatch<PublicDispatch>();
    const { status } = useSelector(selectPublicAccess);

    useEffect(() => {
        void dispatch(openPublicLink(token));
    }, [dispatch, token]);
    usePublicLinkWatch();

    const surface = useMemo(() => publicFlowSurface(token), [token]);

    return {
        surface,
        isReady: status === 'ready',
        isGone: status === 'gone',
        isFailed: status === 'error',
        isSettled: status === 'ready' || status === 'gone' || status === 'error',
        retry: () => void dispatch(openPublicLink(token)),
    };
};
