'use client';
import { useEffect, useState } from 'react';
import {
    initial,
    sendDownloadingReport,
    sendExpiredEnd,
    sendExpiredStart,
} from '../../model/AppThunk';
import { useAppDispatch, useAppSelector } from './redux';
import { IS_PROD } from '../../consts/app-global';

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector(state => state.app);
    const [isMounted, setIsMounted] = useState(false);
    const isExpired = useAppSelector(state => state.app.client.isExpired);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    useEffect(() => {
        if (isMounted && !app.initialized && !app.isLoading) {
            dispatch(initial(IS_PROD));
        }
    }, [isMounted, app.initialized, app.isLoading, dispatch]);
    const domain = app.domain;
    return {
        isLoading: app.isLoading,
        domain,
        isExpired,
        initialized: app.initialized,
        isMounted,
        sendExpiredStart: () => dispatch(sendExpiredStart()),
        sendExpiredEnd: () => dispatch(sendExpiredEnd()),
        sendDownloadingReport: () => dispatch(sendDownloadingReport()),
    };
};
