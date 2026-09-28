'use client';

import { useEffect } from 'react';

/**
 * Доводит читателя до якоря `#id` из адреса после монтирования страницы.
 *
 * Штатная прокрутка браузера к якорю здесь ненадёжна: масштаб содержимого
 * поднимается из localStorage уже после гидратации и сдвигает раскладку,
 * поэтому место, к которому браузер успел прокрутить, уезжает. Прокрутка
 * откладывается на следующий тик — к этому моменту масштаб уже применён.
 *
 * Безопасно для SSR: на сервере эффект не выполняется, `window` не
 * читается при рендере.
 */
export const useHashAnchor = (key: string): void => {
    useEffect(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (!id) return;

        const timer = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ block: 'start' });
        }, 0);

        return () => window.clearTimeout(timer);
    }, [key]);
};
