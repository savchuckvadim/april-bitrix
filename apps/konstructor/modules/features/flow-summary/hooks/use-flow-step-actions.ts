'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/modules/app';
import { selectMainRow } from '@/modules/entities/row-set';
import { findCurrentFlowRoute } from '@/modules/shared/lib/routing';
import { FLOW_STEPS, ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing';
import { useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Соседи текущего шага по FLOW_STEPS. «Далее» сначала выполняет действие
 * экрана (применить параметры, собрать строку) и идёт дальше только по его
 * успеху. «Назад» с первого шага — на старт.
 */
export const useFlowStepActions = (
    onNext?: () => boolean | Promise<boolean>,
) => {
    const pathname = usePathname();
    const nav = useKonstructorNavigation();
    // Комплект выбран — главная кнопка в его цвете (легаси complect--active)
    const isComplectTone = Boolean(useAppSelector(selectMainRow));
    const index = FLOW_STEPS.findIndex(
        step => step.route === findCurrentFlowRoute(pathname),
    );
    const prev = index > 0 ? FLOW_STEPS[index - 1] : null;
    const next = index >= 0 ? (FLOW_STEPS[index + 1] ?? null) : null;

    const goNext = async () => {
        if (!next) return;
        if (onNext && !(await onNext())) return;
        nav.to(next.route);
    };

    return {
        nextLabel: next?.label ?? null,
        isComplectTone,
        goNext,
        goBack: () => nav.to(prev?.route ?? ROUTE_KONSTRUCTOR.START),
    };
};
