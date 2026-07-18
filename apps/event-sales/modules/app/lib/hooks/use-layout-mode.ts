import { useMemo } from 'react';
import { useAppSelector } from './redux';
import { AppLayoutMode, getLayoutMode } from '../utills/layout-util';

/**
 * Текущий режим вёрстки (compact | full) из placement в app-состоянии.
 * Для предпросмотра (в т.ч. вне фрейма Bitrix) режим можно форсировать
 * query-параметром: ?layout=compact | ?layout=full.
 */
export const useLayoutMode = (): AppLayoutMode => {
    const display = useAppSelector(s => s.app.display.mode);

    const override = useMemo<AppLayoutMode | null>(() => {
        if (typeof window === 'undefined') return null;
        const value = new URLSearchParams(window.location.search).get('layout');
        return value === 'compact' || value === 'full' ? value : null;
    }, []);

    return override ?? getLayoutMode(display);
};
