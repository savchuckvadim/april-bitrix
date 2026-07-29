'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/modules/app';
import { selectSnapshotRestored } from '@/modules/entities/snapshot';

/**
 * Декларативный переход конвейера (правило 6: Redux не хранит роут):
 * слепок восстановлен → однократно ведём на /products (легаси: старт
 * сразу на шаге DOCUMENT при вспомненной сделке). Рендерит null.
 */
export const SnapshotNavWatcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const restored = useAppSelector(selectSnapshotRestored);
    const navigated = useRef(false);

    useEffect(() => {
        if (!restored || navigated.current) return;
        navigated.current = true;
        if (pathname !== '/products') router.replace('/products');
    }, [restored, pathname, router]);

    return null;
};
