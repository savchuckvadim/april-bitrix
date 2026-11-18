'use client';

import { useEffect, useState } from 'react';
import { PreloaderScreen } from '@workspace/april-ui';
import { preloadProcessingAssets } from '@workspace/april-ui/feedback';
import { usePace } from './usePace';

/**
 * App-обёртка над единым прелоадером монорепы (@workspace/april-ui):
 * локально остаются только pace и таймер скрытия. Пока прелоадер виден,
 * подгружаем картинку и таймер экрана «конструируем отчёт» — он идёт
 * следующим и должен появиться сразу целиком.
 * Вариант анимации: 'minimal' | 'orb' | 'aurora' | 'liquid'.
 */
const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    usePace();
    useEffect(() => {
        preloadProcessingAssets();
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return <PreloaderScreen variant="brand" logoSrc="/logo/april-x.svg" />;
};

export default LoadingScreen;
