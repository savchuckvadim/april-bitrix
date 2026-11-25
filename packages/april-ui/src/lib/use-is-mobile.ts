'use client';

import { useEffect, useState } from 'react';

/** Телефон: ширина экрана меньше 768px (ниже планшета). */
const QUERY = '(max-width: 767px)';

/**
 * Экран телефона, отслеживается вживую (поворот, изменение окна). До
 * гидратации — false (на сервере matchMedia нет), поэтому компоненты
 * обязаны переживать первый рендер в «десктопном» виде без скачка вёрстки.
 */
export const useIsMobile = (): boolean => {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const query = window.matchMedia(QUERY);
        const read = () => setMobile(query.matches);
        read();
        query.addEventListener('change', read);
        return () => query.removeEventListener('change', read);
    }, []);

    return mobile;
};
