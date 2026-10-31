'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { KONSTRUCTOR_ROUTE_PATH, type ROUTE_KONSTRUCTOR } from './routes';
import { useFlowSurface } from './flow-surface-context';
import { documentPath, type DocumentKind } from './document-kinds';

/**
 * Типизированная навигация конструктора на нативном Next-роутере.
 *
 * Паттерн: thunk меняет состояние и возвращает результат, обработчик UI после
 * dispatch'а вызывает `to(...)`. Объект мемоизирован по роутеру — его можно
 * класть в зависимости эффектов. Адреса строятся от поверхности: у публичной
 * версии в префиксе токен ссылки.
 */
export const useKonstructorNavigation = () => {
    const router = useRouter();
    const { basePath } = useFlowSurface();

    return useMemo(
        () => ({
            to: (route: ROUTE_KONSTRUCTOR) =>
                router.push(`${basePath}${KONSTRUCTOR_ROUTE_PATH[route]}`),
            replace: (route: ROUTE_KONSTRUCTOR) =>
                router.replace(`${basePath}${KONSTRUCTOR_ROUTE_PATH[route]}`),
            toDocument: (kind: DocumentKind) =>
                router.push(`${basePath}${documentPath(kind)}`),
            prefetch: (routes: ROUTE_KONSTRUCTOR[]) =>
                routes.forEach(route =>
                    router.prefetch(`${basePath}${KONSTRUCTOR_ROUTE_PATH[route]}`),
                ),
            back: () => router.back(),
        }),
        [router, basePath],
    );
};
