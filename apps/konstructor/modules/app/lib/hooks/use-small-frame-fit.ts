'use client';

import { useEffect } from 'react';
import { Bitrix } from '@workspace/bitrix';
import { useAppSelector } from './redux';
import { selectAppInitialized, selectIsSmallDisplay } from '../../model/selectors';
import { BROWSER_UI_PX, frameTopOffset, smallFrameHeight } from '../frame/small-frame.util';

/** Как часто сверять окно браузера: фрейм не получает resize, когда меняют окно. */
const CHECK_MS = 1000;

/** Где сейчас верх фрейма относительно окна страницы — по видимой части фрейма. */
const measureFrameTop = (): Promise<number | null> =>
    new Promise(resolve => {
        const observer = new IntersectionObserver(([entry]) => {
            observer.disconnect();
            if (!entry) return resolve(null);
            const viewport = window.outerHeight - BROWSER_UI_PX;
            resolve(
                frameTopOffset(
                    viewport,
                    { top: entry.intersectionRect.top, height: entry.intersectionRect.height },
                    entry.boundingClientRect.height,
                ),
            );
        });
        observer.observe(document.documentElement);
    });

/**
 * Вкладка карточки (маленький экран): фрейм на всю ширину блока и высотой с
 * окно браузера, страница Битрикса подкручивается к шапке приложения. При
 * изменении окна — подгоняется заново. Скролл у приложения свой, поэтому
 * под контент фрейм не растягиваем.
 */
export const useSmallFrameFit = () => {
    const isSmall = useAppSelector(selectIsSmallDisplay);
    const initialized = useAppSelector(selectAppInitialized);

    useEffect(() => {
        if (!initialized || !isSmall) return;
        const api = Bitrix.getService().api;
        let applied = 0;
        let scrolled = false;
        let busy = false;

        const sync = async () => {
            if (busy) return;
            const target = smallFrameHeight(window.outerHeight, window.screen.availHeight);
            const isFitted = target === applied && Math.abs(window.innerHeight - target) <= 1;
            if (isFitted) return;
            busy = true;
            const ok = await api.fitToHeight(target);
            busy = false;
            if (!ok) return;
            applied = target;
            if (scrolled) return;
            scrolled = true;
            // в слайдере Битрикс прокрутку игнорирует — тогда подкрутит сам менеджер
            const top = await measureFrameTop();
            if (top) void api.scrollParentTo(top);
        };

        const onChange = () => void sync();
        onChange();
        const timer = setInterval(onChange, CHECK_MS);
        window.addEventListener('resize', onChange);
        window.addEventListener('focus', onChange);
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', onChange);
            window.removeEventListener('focus', onChange);
        };
    }, [initialized, isSmall]);
};
