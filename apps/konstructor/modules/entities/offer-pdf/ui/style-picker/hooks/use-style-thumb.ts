'use client';

import { useEffect, useRef, useState } from 'react';
import { useStylePreview } from '../../../hooks/use-style-preview';
import type { OfferPdfTemplateCode } from '../../../model/types';

/**
 * Миниатюра стиля: грузится, когда рамка показалась на экране, и рисуется
 * по её ширине (ширина меняется вместе с сеткой).
 */
export const useStyleThumb = (code: OfferPdfTemplateCode, palette: string | null) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const seen = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    seen.disconnect();
                }
            },
            { rootMargin: '200px' },
        );
        const sized = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 0)));
        seen.observe(node);
        sized.observe(node);
        return () => {
            seen.disconnect();
            sized.disconnect();
        };
    }, []);

    return { ref, width, preview: useStylePreview(code, palette, visible) };
};
