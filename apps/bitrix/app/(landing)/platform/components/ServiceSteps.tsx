import type { PlatformStep } from '../model/types';
import type { ShotMediaMap } from '../lib/platform-media';
import { hasVisibleStepShots } from '../lib/service-layout';
import { StepCards } from './StepCards';
import { StepRows } from './StepRows';

export interface ServiceStepsProps {
    items: readonly PlatformStep[];
    media: ShotMediaMap;
}

/** «Как это работает»: с кадрами — строками, без кадров — сеткой. */
export function ServiceSteps({ items, media }: ServiceStepsProps) {
    return hasVisibleStepShots(items, media) ? (
        <StepRows items={items} media={media} />
    ) : (
        <StepCards items={items} />
    );
}
