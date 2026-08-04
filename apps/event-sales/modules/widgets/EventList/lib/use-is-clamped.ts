'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Обрезан ли текст line-clamp'ом. Меряем по факту (scrollHeight > clientHeight),
 * а не по длине строки: сколько строк влезло, зависит от ширины и шрифта.
 * Нужно, чтобы не показывать кнопку «Показать полностью» там, где и так всё видно.
 */
export const useIsClamped = (
    ref: RefObject<HTMLElement | null>,
    text: string,
): boolean => {
    const [isClamped, setIsClamped] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const check = () =>
            setIsClamped(element.scrollHeight > element.clientHeight + 1);

        check();

        const observer = new ResizeObserver(check);
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, text]);

    return isClamped;
};
