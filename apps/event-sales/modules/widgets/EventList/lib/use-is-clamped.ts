'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Обрезан ли текст line-clamp'ом. Меряем по факту (scrollHeight > clientHeight),
 * а не по длине строки: сколько строк влезло, зависит от ширины и шрифта.
 * Нужно, чтобы не показывать кнопку «Показать полностью» там, где и так всё видно.
 *
 * `enabled: false` замораживает последнее значение вместо перезамера. Нужно
 * раскрытому «туману»: без ограничения высоты элемент не обрезан, замер дал бы
 * false — и кнопка «Свернуть» размонтировалась бы прямо под фокусом в кадре
 * после клика (фокус улетал в body).
 */
export const useIsClamped = (
    ref: RefObject<HTMLElement | null>,
    text: string,
    enabled = true,
): boolean => {
    const [isClamped, setIsClamped] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || !enabled) return;

        const check = () =>
            setIsClamped(element.scrollHeight > element.clientHeight + 1);

        check();

        const observer = new ResizeObserver(check);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, text, enabled]);

    return isClamped;
};
