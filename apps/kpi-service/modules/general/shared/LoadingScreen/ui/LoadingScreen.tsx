'use client';

import { useEffect, useState } from 'react';
import { PreloaderScreen } from '@workspace/april-ui';
import { preloadProcessingAssets } from '@workspace/april-ui/feedback';
import { withBasePath } from '@/modules/shared/lib/base-path';
import { usePace } from '../hooks/usePace';

/**
 * App-обёртка над единым прелоадером монорепы (@workspace/april-ui):
 * локально остаются только pace и таймер скрытия. Пока прелоадер виден,
 * подгружаем картинку и таймер экрана «конструируем отчёт» (тот же адрес
 * картинки, что у ProcessingScreen по умолчанию).
 * Вариант анимации: 'minimal' | 'brand' | 'orb' | 'aurora' | 'liquid'.
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

    return (
        <PreloaderScreen
            variant="brand"
            logoSrc={withBasePath('/logo/logo.svg')}
        />
    );
};

export default LoadingScreen;
