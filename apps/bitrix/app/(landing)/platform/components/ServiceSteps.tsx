import type { PlatformStep } from '../model/types';
import { hasVisibleStepShots } from '../lib/service-layout';
import { StepCards } from './StepCards';
import { StepRows } from './StepRows';

export interface ServiceStepsProps {
    items: readonly PlatformStep[];
}

/** «Как это работает»: с кадрами — строками, без кадров — сеткой. */
export function ServiceSteps({ items }: ServiceStepsProps) {
    return hasVisibleStepShots(items) ? <StepRows items={items} /> : <StepCards items={items} />;
}
