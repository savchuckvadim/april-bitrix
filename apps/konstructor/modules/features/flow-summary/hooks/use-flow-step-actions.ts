'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/modules/app';
import { selectMainRow } from '@/modules/entities/row-set';
import { findCurrentFlowRoute } from '@/modules/shared/lib/routing';
import { ROUTE_KONSTRUCTOR, useFlowSurface } from '@/modules/shared/lib/routing';
import { useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Соседи текущего шага по шагам поверхности. «Далее» сначала выполняет действие
 * экрана (применить параметры, собрать строку) и идёт дальше только по его
 * успеху. «Назад» с первого шага — на старт, если он есть.
 */
export const useFlowStepActions = (
    onNext?: () => boolean | Promise<boolean>,
) => {
    const pathname = usePathname();
    const nav = useKonstructorNavigation();
    const surface = useFlowSurface();
    // Комплект выбран — главная кнопка в его цвете (легаси complect--active)
    const isComplectTone = Boolean(useAppSelector(selectMainRow));
    const index = surface.steps.findIndex(
        step => step.route === findCurrentFlowRoute(pathname, surface),
    );
    const prev = index > 0 ? surface.steps[index - 1] : null;
    const next = index >= 0 ? (surface.steps[index + 1] ?? null) : null;

    const goNext = async () => {
        if (!next) return;
        if (onNext && !(await onNext())) return;
        nav.to(next.route);
    };

    return {
        nextLabel: next?.label ?? null,
        isComplectTone,
        goNext,
        canGoBack: Boolean(prev) || surface.hasStartScreen,
        goBack: () => nav.to(prev?.route ?? ROUTE_KONSTRUCTOR.START),
    };
};
