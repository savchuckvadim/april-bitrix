'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/modules/app';
import { selectMainRow } from '@/modules/entities/row-set';
import { resolveFlowSteps } from '@/modules/shared/lib/routing';
import type { FlowRoute } from '@/modules/shared/lib/routing';
import { useKonstructorNavigation } from '@/modules/shared/lib/routing';

/** Степпер шагов: состояния по адресу, переход по клику. */
export const useFlowNav = () => {
    const pathname = usePathname();
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const nav = useKonstructorNavigation();

    const steps = useMemo(
        () => resolveFlowSteps(pathname, hasMainRow),
        [pathname, hasMainRow],
    );

    return {
        steps,
        // Комплект выбран — шаги красятся его цветом (data-complect рамки)
        tone: hasMainRow ? ('complect' as const) : ('primary' as const),
        select: (code: string) => nav.to(code as FlowRoute),
    };
};
