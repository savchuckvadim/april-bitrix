'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bitrix } from '@workspace/bitrix';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { shouldFitWindow } from '@/modules/app/lib/utills/placement-util';

/**
 * Через сколько повторить подгонку после отрисовки. Первый замер делаем в
 * следующем кадре, но данные приезжают асинхронно и высота ещё меняется —
 * поэтому повторяем, когда список/карточка уже наполнились.
 */
const REFIT_DELAYS_MS = [300, 1200];

/**
 * Подгонка высоты фрейма под контент на каждой странице.
 *
 * Только для вкладок карточки — см. `shouldFitWindow`. Во встройке таймлайна
 * вызов запрещён: приложение там на весь экран, и подгонка его схлопнет.
 *
 * Зависит от роута и от готовности приложения: пока не отрисован контент,
 * мерить нечего — фрейм подогнался бы под пустую страницу.
 */
export const useFitWindow = () => {
    const pathname = usePathname();
    const placement = useAppSelector(s => s.app.bitrix.placement);
    const initialized = useAppSelector(s => s.app.initialized);

    useEffect(() => {
        if (!initialized || !shouldFitWindow(placement)) return;

        const fit = () => {
            try {
                Bitrix.getService().api.getFit();
            } catch (error) {
                // Вне фрейма сервиса Bitrix нет — в dev это норма.
                console.debug('fitWindow skipped', error);
            }
        };

        const frame = requestAnimationFrame(fit);
        const timers = REFIT_DELAYS_MS.map(delay => setTimeout(fit, delay));

        return () => {
            cancelAnimationFrame(frame);
            timers.forEach(clearTimeout);
        };
    }, [pathname, placement, initialized]);
};
