'use client';

import type { LtPlacement } from '@/modules/entities/composition';
import { cn } from '@workspace/ui/lib/utils';

export interface LtPlacementTagProps {
    placement: LtPlacement;
    /** Без правил метка переносит сервис между бесплатными и платными */
    onMove?: (to: LtPlacement) => void;
}

const LABEL: Record<LtPlacement, string> = { included: 'в комплекте', paid: 'платно' };
const BASE = 'text-[0.6875rem] leading-none';

/** Куда система положила сервис. */
export const LtPlacementTag = ({ placement, onMove }: LtPlacementTagProps) => {
    const tone = placement === 'paid' ? 'font-medium text-foreground' : 'text-muted-foreground';
    if (!onMove) return <span className={cn(BASE, tone)}>{LABEL[placement]}</span>;

    const target: LtPlacement = placement === 'paid' ? 'included' : 'paid';
    return (
        <button
            type="button"
            title={`Перенести: ${LABEL[target]}`}
            onClick={() => onMove(target)}
            className={cn(BASE, tone, 'cursor-pointer underline decoration-dotted underline-offset-2')}
        >
            {LABEL[placement]}
        </button>
    );
};
