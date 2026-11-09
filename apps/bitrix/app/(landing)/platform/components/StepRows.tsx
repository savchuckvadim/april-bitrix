import { cn } from '@workspace/ui/lib/utils';
import type { PlatformStep } from '../model/types';
import type { ShotMediaMap } from '../lib/platform-media';
import { isShotVisible } from '../lib/shot-visibility';
import { ShotFrame } from './ShotFrame';
import { StepNumber } from './StepNumber';

export interface StepRowsProps {
    items: readonly PlatformStep[];
    media: ShotMediaMap;
}

/** Шаги с кадрами: текст и скрин рядом, стороны чередуются. */
export function StepRows({ items, media }: StepRowsProps) {
    return (
        <ol className="flex flex-col gap-14 lg:gap-20">
            {items.map((step, index) => {
                const withShot = step.shotId !== undefined && isShotVisible(step.shotId, media);
                return (
                    <li
                        key={step.title}
                        className={cn('grid items-center gap-8', withShot && 'lg:grid-cols-[2fr_3fr]')}
                    >
                        <div className={cn('flex max-w-2xl flex-col gap-3', withShot && index % 2 === 1 && 'lg:order-2')}>
                            <StepNumber value={index + 1} />
                            <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                            <p className="text-pretty text-lg text-muted-foreground">{step.text}</p>
                        </div>
                        {withShot && step.shotId && (
                            <ShotFrame shotId={step.shotId} media={media.get(step.shotId)} />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
