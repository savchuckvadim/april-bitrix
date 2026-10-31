import type { StepNavItem } from '@workspace/april-ui/navigation';
import { BITRIX_FLOW_SURFACE, type FlowSurface } from './flow-surface';
import { KONSTRUCTOR_ROUTE_PATH, type FlowRoute } from './routes';

const isUnder = (pathname: string, path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

/** Шаг, которому принадлежит адрес (`/document/offer` — шагу «Документ»). */
export const findCurrentFlowRoute = (
    pathname: string,
    surface: FlowSurface = BITRIX_FLOW_SURFACE,
): FlowRoute | null =>
    surface.steps.find(step =>
        isUnder(pathname, `${surface.basePath}${KONSTRUCTOR_ROUTE_PATH[step.route]}`),
    )?.route ?? null;

/**
 * Состояния шагов для степпера: до текущего — пройдены, после — впереди.
 * Пока главный товар не собран, шаги дальше «Параметров» закрыты: им нечего
 * показывать.
 */
export const resolveFlowSteps = (
    pathname: string,
    hasMainRow: boolean,
    surface: FlowSurface = BITRIX_FLOW_SURFACE,
): StepNavItem[] => {
    const current = findCurrentFlowRoute(pathname, surface);
    const currentIndex = surface.steps.findIndex(step => step.route === current);

    return surface.steps.map((step, index) => ({
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
