'use client'
import { useEffect, useState } from 'react';
import {
    initial,
    sendDownloadingReport,
    sendExpiredEnd,
    sendExpiredStart,
} from '../../model/AppThunk';
import { useAppDispatch, useAppSelector } from './redux';
import { store } from '../../model/store';
import { appActions } from '../../model/AppSlice';

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector(state => state.app);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {

        if (isMounted) {
            if (typeof window !== 'undefined') {


                (window as any).store = store;
            }
        }

    }, [isMounted]);
    useEffect(() => {
        if (isMounted && !app.initialized && !app.isLoading) {
            dispatch(initial());
        }
    }, [isMounted, app.initialized, app.isLoading, dispatch]);
    const expiredClientReady = () => {
        dispatch(appActions.setExpiredClient({ isExpired: false }));
    };

    return {
        domain: app.domain,
        initialized: app.initialized,
        isLoading: app.isLoading,
        isClient: isMounted,
        isExpired: app.client.isExpired,
        expiredClientReady,
        sendExpiredStart: () => dispatch(sendExpiredStart()),
        sendExpiredEnd: () => dispatch(sendExpiredEnd()),
        sendDownloadingReport: () => dispatch(sendDownloadingReport()),
    };
};
