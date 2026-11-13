'use client';

import { useEffect, useRef, useState } from 'react';
import { useTemplatePreview } from '@/modules/entities/offer-template-word';

/**
 * Превью в карточке: грузится, когда карточка показалась на экране, и
 * рисуется по ширине карточки (ширина меняется вместе с сеткой).
 */
export const useCardPreview = (id: string, version: number) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const seen = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                setVisible(true);
                seen.disconnect();
            }
        }, { rootMargin: '200px' });
        const sized = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 0)));
        seen.observe(node);
        sized.observe(node);
        return () => {
            seen.disconnect();
            sized.disconnect();
        };
    }, []);

    return { ref, width, state: useTemplatePreview(id, visible, version) };
};
