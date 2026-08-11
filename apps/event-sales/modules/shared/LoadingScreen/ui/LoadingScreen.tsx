'use client';

import { useEffect, useState } from 'react';
import { PreloaderScreen } from '@workspace/april-ui';
import { withBasePath } from '@/modules/app/lib/utills/base-path';
import { usePace } from '../hooks/usePace';

/**
 * App-обёртка над единым прелоадером монорепы (@workspace/april-ui):
 * локально остаются только pace и таймер скрытия.
 * Вариант анимации: 'minimal' | 'brand' | 'orb' | 'aurora' | 'liquid'.
 */
const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    usePace();
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return <PreloaderScreen variant="brand" logoSrc={withBasePath('/logo/logo.svg')} />;
};

export default LoadingScreen;
