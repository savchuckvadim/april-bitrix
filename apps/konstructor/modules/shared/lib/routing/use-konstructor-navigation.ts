'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { KONSTRUCTOR_ROUTE_PATH, type ROUTE_KONSTRUCTOR } from './routes';
import { documentPath, type DocumentKind } from './document-kinds';

/**
 * Типизированная навигация конструктора на нативном Next-роутере.
 *
 * Паттерн: thunk меняет состояние и возвращает результат, обработчик UI после
 * dispatch'а вызывает `to(...)`. Объект мемоизирован по роутеру — его можно
 * класть в зависимости эффектов.
 */
export const useKonstructorNavigation = () => {
    const router = useRouter();

    return useMemo(
        () => ({
            to: (route: ROUTE_KONSTRUCTOR) =>
                router.push(KONSTRUCTOR_ROUTE_PATH[route]),
            replace: (route: ROUTE_KONSTRUCTOR) =>
                router.replace(KONSTRUCTOR_ROUTE_PATH[route]),
            toDocument: (kind: DocumentKind) => router.push(documentPath(kind)),
            prefetch: (routes: ROUTE_KONSTRUCTOR[]) =>
                routes.forEach(route =>
                    router.prefetch(KONSTRUCTOR_ROUTE_PATH[route]),
                ),
            back: () => router.back(),
        }),
        [router],
    );
};
