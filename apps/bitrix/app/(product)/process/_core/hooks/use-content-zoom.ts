'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'april-process-zoom';

/** Шаги масштаба в процентах. 100 — обычный размер. */
export const ZOOM_STEPS = [70, 80, 90, 100, 110, 125, 150] as const;

const DEFAULT_ZOOM = 100;

const clamp = (value: number): number =>
    ZOOM_STEPS.includes(value as (typeof ZOOM_STEPS)[number])
        ? value
        : DEFAULT_ZOOM;

/**
 * Масштаб содержимого страницы.
 *
 * Схема плотная: на проекторе её хотят увеличить, на ноутбуке — наоборот,
 * уместить целиком. Браузерный zoom для этого не годится — он утаскивает и
 * шапку с меню, а они и так на месте.
 *
 * Значение читаем в эффекте, а не при первом рендере: на сервере localStorage
 * нет, и несовпадение дало бы ошибку гидратации.
 */
export const useContentZoom = () => {
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

    useEffect(() => {
        try {
            const stored = Number(localStorage.getItem(KEY));
            if (stored) setZoom(clamp(stored));
        } catch {
            // приватный режим — остаёмся на обычном размере
        }
    }, []);

    const apply = useCallback((next: number) => {
        setZoom(next);
        try {
            localStorage.setItem(KEY, String(next));
        } catch {
            // приватный режим — масштаб живёт до перезагрузки
        }
    }, []);

    const index = ZOOM_STEPS.indexOf(zoom as (typeof ZOOM_STEPS)[number]);

    return {
        zoom,
        canZoomOut: index > 0,
        canZoomIn: index < ZOOM_STEPS.length - 1,
        zoomOut: () => apply(ZOOM_STEPS[Math.max(0, index - 1)]!),
        zoomIn: () =>
            apply(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, index + 1)]!),
        reset: () => apply(DEFAULT_ZOOM),
    };
};
