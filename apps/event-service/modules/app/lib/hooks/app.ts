'use client';
import { useEffect, useState } from 'react';
import { Bitrix } from '@workspace/bitrix';
import { useAppDispatch, useAppSelector } from './redux';
import { initial, reloadApp } from '../../model/thunk/AppThunk';

// Resize the Bitrix placement iframe to fit content (no-op outside a Bitrix frame).
const fitApp = async () => {
    try {
        await Bitrix.getService()?.api.getFit();
    } catch {
        /* not in a Bitrix frame */
    }
};

export const useApp = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector(state => state.app);
    const [isClient, setIsClient] = useState(false);
    const [ready, setReady] = useState(false);
    // const hasCompany = app.bitrix.company && app.bitrix.company.ID;
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !app.initialized && !app.isLoading) {
            dispatch(initial());
        }

        if (isClient && app.initialized && !app.isLoading) {
            if (!ready) {
                setReady(true);
            }
        } else {
            if (ready) {
                setReady(false);
            }
        }
    }, [isClient, app.initialized, app.isLoading, dispatch]);

    return {
        isClient,
        ready,
        fitApp,
        // hasCompany,
        app,
        initialized: app.initialized,
        isLoading: app.isLoading,
        domain: app.domain,
        // companyId: app.bitrix.company?.ID || 0,
    };
};
export const useReload = () => {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector(state => state.app);
    const reload = () => {
        dispatch(reloadApp());
    };
    return { reload, isLoading };
};
