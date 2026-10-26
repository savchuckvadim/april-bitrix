'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { PreloaderScreen } from '@workspace/april-ui';
import { BootPreloaderGate } from '@workspace/april-ui/feedback';

import { useApp } from '../lib/hooks/app';
import {
    NON_AUTH_ERROR,
    NO_COMPANY_ERROR,
    NO_DEAL_ERROR,
} from '../lib/initialize/app-init/app-init.util';
import { DEV_PLACEMENT_HINT, IS_PROD } from '../consts/app-global';
import { store } from '../model/store';
import { NonAuthScreen } from './NonAuthScreen';
import { NoCompanyScreen } from './NoCompanyScreen';
import { NoDealScreen } from './NoDealScreen';
import { DevPlacementScreen } from './DevPlacementScreen';

declare global {
    interface Window {
        /** Dev-консоль: store.getState() в браузере (dev-guide §7) */
        store?: typeof store;
    }
}

/**
 * Гейт приложения: инициализация Bitrix → готовый экран.
 *
 * Экран загрузки один — SSR boot-прелоадер из корневого layout; гасится по
 * готовности приложения, а не по гидратации. PreloaderScreen — только на
 * повторную инициализацию (⟳), когда boot-прелоадера в DOM уже нет.
 */
export const App = ({ children }: { children: ReactNode }) => {
    const { app, initialized, isLoading, isClient } = useApp();

    // Dev-консоль: store.getState() в браузере (рецепты — docs/dev-guide.md §7)
    useEffect(() => {
        if (!IS_PROD) {
            window.store = store;
        }
    }, []);

    const isReady = isClient && initialized && !isLoading;
    const errorMessage = isClient && app.error.status ? app.error.message : null;
    const isNonAuth = errorMessage === NON_AUTH_ERROR;
    const isNoCompany = errorMessage === NO_COMPANY_ERROR;
    const isNoDeal = errorMessage === NO_DEAL_ERROR;
    const isDevHint = errorMessage === DEV_PLACEMENT_HINT;
    const isGate = isNonAuth || isNoCompany || isNoDeal || isDevHint;

    return (
        <>
            {/* Гейт-экран — тоже «готово»: иначе прелоадер висел бы над ним
                до предохранителя maxWaitMs. */}
            <BootPreloaderGate ready={isReady || isGate} />
            {isNonAuth && <NonAuthScreen />}
            {isNoCompany && <NoCompanyScreen />}
            {isNoDeal && <NoDealScreen />}
            {isDevHint && <DevPlacementScreen />}
            {!isGate && (
                <>
                    {!isReady && isClient && (
                        <PreloaderScreen variant="brand" />
                    )}
                    {isReady ? children : null}
                </>
            )}
        </>
    );
};

export default App;
