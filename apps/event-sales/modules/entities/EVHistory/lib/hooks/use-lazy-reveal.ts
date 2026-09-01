'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createLazyReveal } from '../lazy-reveal';

/**
 * Ленивая загрузка секции по первому ПОКАЗУ: возвращает callback-ref для
 * узла контента; когда узел (существует = карточка раскрыта) попадает во
 * вьюпорт — один раз зовётся `onReveal`.
 *
 * Вся семантика — в createLazyReveal (там же её тесты); здесь только
 * жизненный цикл React: контроллер на маунт, dispose на unmount, свежий
 * onReveal через ref (ref-callback обязан быть стабильным, иначе React
 * дёргал бы attach(null)+attach(node) на каждый рендер).
 */
export const useLazyReveal = (
    onReveal: () => void,
): ((node: Element | null) => void) => {
    const onRevealRef = useRef(onReveal);
    onRevealRef.current = onReveal;

    const [controller] = useState(() =>
        createLazyReveal(() => onRevealRef.current()),
    );

    useEffect(() => () => controller.dispose(), [controller]);

    return useCallback(node => controller.attach(node), [controller]);
};
