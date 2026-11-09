import type { PlatformStep } from '../model/types';
import { StepNumber } from './StepNumber';

export interface StepCardsProps {
    items: readonly PlatformStep[];
}

/** Шаги без кадров: компактной сеткой, чтобы не растягивать страницу. */
export function StepCards({ items }: StepCardsProps) {
    return (
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-3">
                    <StepNumber value={index + 1} />
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-pretty text-muted-foreground">{step.text}</p>
                </li>
            ))}
        </ol>
    );
}
