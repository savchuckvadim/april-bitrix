'use client';

import { useEffect } from 'react';

/** Сколько держится подсветка найденного места. */
const HIGHLIGHT_MS = 2600;

/**
 * Доводит читателя ровно до того места схемы, ради которого он сюда пришёл.
 *
 * Штатная прокрутка к якорю здесь не работает: конфигурация поднимается из
 * localStorage уже после гидратации, и в момент навигации нужного узла на
 * странице ещё нет. Поэтому ждём его появления и только потом скроллим.
 *
 * Подсветка не украшение: страница длинная, и без неё человек приезжает в
 * середину простыни карточек, не понимая, на какую именно смотреть.
 */
export const useScrollToTarget = (ready: boolean): void => {
    useEffect(() => {
        if (!ready || typeof window === 'undefined') return;

        const id = window.location.hash.slice(1);
        if (!id) return;

        let timer: ReturnType<typeof setTimeout> | undefined;

        const observer = new MutationObserver(() => {
            const target = document.getElementById(id);
            if (!target) return;

            observer.disconnect();
            target.scrollIntoView({ block: 'center', behavior: 'smooth' });
            target.dataset.highlighted = 'true';
            timer = setTimeout(() => {
                delete target.dataset.highlighted;
            }, HIGHLIGHT_MS);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
        };
    }, [ready]);
};
