'use client';

import { useEffect, useState } from 'react';

/**
 * Возвращает id секции, находящейся сейчас в зоне чтения.
 * Используется для подсветки активного пункта в sidebar.
 */
export const useScrollspy = (sectionIds: string[]): string => {
    const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) setActiveId(visible.target.id);
            },
            { rootMargin: '-20% 0px -70% 0px' },
        );
        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
        return () => observer.disconnect();
    }, [sectionIds]);

    return activeId;
};
