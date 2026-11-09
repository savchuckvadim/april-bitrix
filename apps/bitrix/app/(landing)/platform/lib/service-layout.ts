import type { PlatformStep } from '../model/types';
import { isShotVisible } from './shot-visibility';

/** Есть ли у шагов хоть один кадр, который появится на странице. */
export const hasVisibleStepShots = (items: readonly PlatformStep[]): boolean =>
    items.some(step => step.shotId !== undefined && isShotVisible(step.shotId));
