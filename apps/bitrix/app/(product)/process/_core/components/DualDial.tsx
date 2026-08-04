'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { CoverageDial } from './CoverageDial';

interface DualDialProps {
    leadPct: number;
    dealPct: number;
    onLeadChange: (value: number) => void;
    onDealChange: (value: number) => void;
    className?: string;
}

/**
 * Два независимых ползунка — главный орган управления страницей.
 *
 * Лид растёт вперёд от начала процесса, сделка — назад от конца. Они не делят
 * процесс пополам: между ними может остаться разрыв, они могут перекрыться и
 * даже полностью совпасть.
 */
export const DualDial: FC<DualDialProps> = ({
    leadPct,
    dealPct,
    onLeadChange,
    onDealChange,
    className,
}) => (
    <div className={cn('flex flex-col gap-5', className)}>
        <CoverageDial
            label="Лид"
            direction="forward"
            value={leadPct}
            onChange={onLeadChange}
            rangeClass="[&_[data-slot=slider-range]]:bg-event-lead"
            thumbClass="[&_[data-slot=slider-thumb]]:border-event-lead"
            valueClass="text-event-lead"
            hint="Растёт вперёд от начала. 0 % — лида в процессе нет."
        />

        <CoverageDial
            label="Сделка"
            direction="backward"
            value={dealPct}
            onChange={onDealChange}
            rangeClass="[&_[data-slot=slider-range]]:bg-primary"
            thumbClass="[&_[data-slot=slider-thumb]]:border-primary"
            valueClass="text-primary"
            hint="Растёт назад от конца. 0 % — сделка только в финале: продажа сама по себе и есть сделка."
        />
    </div>
);
