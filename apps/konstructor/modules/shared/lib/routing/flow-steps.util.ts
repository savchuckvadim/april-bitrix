import type { StepNavItem } from '@workspace/april-ui/navigation';
import {
    FLOW_STEPS,
    KONSTRUCTOR_ROUTE_PATH,
    type FlowRoute,
} from './routes';

const isUnder = (pathname: string, path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

/** Шаг, которому принадлежит адрес (`/document/offer` — шагу «Документ»). */
export const findCurrentFlowRoute = (pathname: string): FlowRoute | null =>
    FLOW_STEPS.find(step => isUnder(pathname, KONSTRUCTOR_ROUTE_PATH[step.route]))
        ?.route ?? null;

/**
 * Состояния шагов для степпера: до текущего — пройдены, после — впереди.
 * Пока главный товар не собран, шаги дальше «Параметров» закрыты: им нечего
 * показывать.
 */
export const resolveFlowSteps = (
    pathname: string,
    hasMainRow: boolean,
): StepNavItem[] => {
    const current = findCurrentFlowRoute(pathname);
    const currentIndex = FLOW_STEPS.findIndex(step => step.route === current);

    return FLOW_STEPS.map((step, index) => ({
        code: step.route,
        label: step.label,
        state:
            index === currentIndex
                ? 'current'
                : index < currentIndex
                  ? 'done'
                  : 'upcoming',
        disabled: step.needsMainRow && !hasMainRow,
    }));
};
