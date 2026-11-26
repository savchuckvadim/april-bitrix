'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { PreloaderScreen } from '@workspace/april-ui';
import { BootPreloaderGate } from '@workspace/april-ui/feedback';

import { withBasePath } from '@/modules/shared/lib/base-path';

import { useApp } from '../lib/hooks/app';
import { useSmallFrameFit } from '../lib/hooks/use-small-frame-fit';
import { IS_PROD } from '../consts/app-global';
import { store } from '../model/store';
import { GATE_SCREENS } from './gate-screens';

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
    // вкладка карточки: фрейм с окно браузера, шапка приложения к верху окна
    useSmallFrameFit();

    // Dev-консоль: store.getState() в браузере (рецепты — docs/dev-guide.md §7)
    useEffect(() => {
        if (!IS_PROD) {
            window.store = store;
        }
    }, []);

    const isReady = isClient && initialized && !isLoading;
    const errorMessage = isClient && app.error.status ? app.error.message : null;
    const GateScreen = errorMessage ? GATE_SCREENS.get(errorMessage) : undefined;
    const isGate = Boolean(GateScreen);

    return (
        <>
            {/* Гейт-экран — тоже «готово»: иначе прелоадер висел бы над ним
                до предохранителя maxWaitMs. */}
            <BootPreloaderGate ready={isReady || isGate} />
            {GateScreen ? <GateScreen /> : null}
            {!isGate && (
                <>
                    {!isReady && isClient && (
                        <PreloaderScreen
                            variant="brand"
                            logoSrc={withBasePath('/logo/logo.svg')}
                        />
                    )}
                    {isReady ? children : null}
                    {/* долгое действие (документ → сделка): поверх экрана, до ухода в сделку */}
                    {isReady && app.busy ? (
                        <PreloaderScreen
                            variant="brand"
                            title={app.busy}
                            logoSrc={withBasePath('/logo/logo.svg')}
                        />
                    ) : null}
                </>
            )}
        </>
    );
};

export default App;
