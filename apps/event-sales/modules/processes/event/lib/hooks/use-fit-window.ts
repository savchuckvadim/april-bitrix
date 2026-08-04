'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bitrix } from '@workspace/bitrix';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { shouldFitWindow } from '@/modules/app/lib/utills/placement-util';

/**
 * Пауза перед подгонкой после изменения высоты. Меньше — дёргаем фрейм на
 * каждый кадр анимации раскрытия секции, больше — заметна ступенька.
 */
const FIT_DEBOUNCE_MS = 120;

/**
 * Подгонка высоты фрейма под контент.
 *
 * Только для вкладок карточки — см. `shouldFitWindow`. Во встройке таймлайна
 * вызов запрещён: приложение там на весь экран, и подгонка его схлопнет.
 *
 * Следим за реальной высотой документа, а не зовём по таймеру после перехода.
 * Причина конкретная: страница элемента доезжает лениво (chunk + данные) и
 * растёт уже после перехода — фиксированные задержки успевали померить старую
 * высоту, и карточка вылезала за фрейм. ResizeObserver ловит любой рост:
 * загрузку чанка, приход данных, раскрытие секции, открытие диалога.
 */
export const useFitWindow = () => {
    const pathname = usePathname();
    const placement = useAppSelector(s => s.app.bitrix.placement);
    const initialized = useAppSelector(s => s.app.initialized);

    useEffect(() => {
        if (!initialized || !shouldFitWindow(placement)) return;

        let timer: ReturnType<typeof setTimeout> | undefined;

        const fit = () => {
            try {
                Bitrix.getService().api.getFit();
            } catch (error) {
                // Вне фрейма сервиса Bitrix нет — в dev это норма.
                console.debug('fitWindow skipped', error);
            }
        };

        const scheduleFit = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(fit, FIT_DEBOUNCE_MS);
        };

        // Первый замер — в следующем кадре, когда новая страница уже в DOM.
        const frame = requestAnimationFrame(scheduleFit);

        const observer = new ResizeObserver(scheduleFit);
        observer.observe(document.documentElement);
        if (document.body) observer.observe(document.body);

        return () => {
            cancelAnimationFrame(frame);
            if (timer) clearTimeout(timer);
            observer.disconnect();
        };
    }, [pathname, placement, initialized]);
};
