'use client';

import { BootPreloaderGate } from '@workspace/april-ui/feedback';
import { useApp } from '../lib/hooks/app';

/**
 * Обёртка страниц, которым нужна инициализация Bitrix-приложения. Стоит не
 * глобально, а в layout'ах конкретных групп — (auth), (integrations)/install,
 * (product)/bitrix, (protected); публичный сайт через неё не проходит.
 *
 * Экран загрузки ровно один — SSR boot-прелоадер из корневого layout. Здесь он
 * удерживается до готовности данных, вместо того чтобы гаснуть по факту
 * гидратации и уступать место второму экрану. Раньше на его месте рисовался
 * собственный LoadingScreen с framer-motion и WebGL-Orb: тяжёлый экран поверх
 * уже показанного лёгкого, то есть он появлялся позже всего, что скрывал.
 */
export const App = ({
    children,
    isInstall = false,
}: {
    children: React.ReactNode;
    isInstall?: boolean;
}) => {
    const { initialized, isLoading, isClient } = useApp(isInstall);

    const isReady = isClient && initialized && !isLoading;

    return (
        <div className="h-calc(100vh - 300px)">
            <BootPreloaderGate ready={isReady} />
            {isReady ? children : null}
        </div>
    );
};

export default App;
