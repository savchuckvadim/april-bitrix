'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFxFlag } from '@workspace/ui/hooks/use-fx-token';
import {
    GlassPreference,
    getGlassPreference,
    setGlassPreference,
} from './glass-preference';

export interface UseGlassResult {
    /**
     * Видно ли стекло прямо сейчас — резолвнутое значение токена --fx-glass,
     * а не намерение пользователя. По нему решают, рендерить ли тяжёлые
     * стеклянные компоненты (GlassSurface с SVG-рефракцией).
     */
    enabled: boolean;
    /** Выбор пользователя: on / off / system (решает система). */
    preference: GlassPreference;
    setPreference: (next: GlassPreference) => void;
    /** Переключает между on и off, минуя system. */
    toggle: () => void;
}

/**
 * Единая точка доступа к стеклу для всей монорепы.
 *
 * Источник правды — CSS-токен `--fx-glass` (packages/ui/src/styles/tokens/
 * effects.css), поэтому «выключить стекло везде» — это одно место, а не
 * обход компонент.
 *
 * До гидратации `enabled` = true: так монорепа выглядит по умолчанию, значит
 * первый клиентский рендер совпадает с серверным и вспышки нет.
 */
export const useGlass = (): UseGlassResult => {
    const enabled = useFxFlag('--fx-glass', true);

    // Намерение читаем только на клиенте: на сервере localStorage нет,
    // а несовпадение с первым рендером даст ошибку гидратации.
    const [preference, setPreferenceState] = useState<GlassPreference>('system');

    useEffect(() => {
        setPreferenceState(getGlassPreference());
    }, []);

    const setPreference = useCallback((next: GlassPreference) => {
        setGlassPreference(next);
        setPreferenceState(next);
    }, []);

    const toggle = useCallback(() => {
        // Отталкиваемся от того, что реально видно: если система погасила
        // стекло, первый клик должен его зажечь, а не «выключить выключенное».
        const isVisible =
            document.documentElement.dataset.glass === 'on' ||
            getComputedStyle(document.documentElement)
                .getPropertyValue('--fx-glass')
                .trim() === '1';
        setPreference(isVisible ? 'off' : 'on');
    }, [setPreference]);

    return { enabled, preference, setPreference, toggle };
};
