import {
    FLOW_STEPS,
    ROUTE_KONSTRUCTOR,
    type FlowSurface,
} from '@/modules/shared/lib/routing';

/** Документов в публичной версии нет: шаг «Цены» последний. */
const PUBLIC_STEPS = FLOW_STEPS.filter(
    step => step.route !== ROUTE_KONSTRUCTOR.DOCUMENT,
);

export const publicBasePath = (token: string): string =>
    `/p/${encodeURIComponent(token)}`;

export const publicFlowSurface = (token: string): FlowSurface => ({
    basePath: publicBasePath(token),
    steps: PUBLIC_STEPS,
    hasStartScreen: false,
});
