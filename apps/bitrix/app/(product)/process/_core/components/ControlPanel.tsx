'use client';

import type { FC } from 'react';
import { GlassCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { DIALS_ANCHOR } from '../lib/anchors.util';
import { ProcessVerdict } from '../copy/verdict';
import { ProcessPreset } from '../types';
import { DualDial } from './DualDial';
import { PresetChips } from './PresetChips';
import { VerdictLine } from './VerdictLine';

export interface ControlPanelProps {
    leadPct: number;
    dealPct: number;
    presets: ProcessPreset[];
    activePresetId: string | null;
    verdict: ProcessVerdict;
    onLeadChange: (value: number) => void;
    onDealChange: (value: number) => void;
    onApplyPreset: (preset: ProcessPreset) => void;
    /** Компактный режим для вида без скролла. */
    compact?: boolean;
    className?: string;
}

/**
 * Пульт: две крутилки, готовые схемы и вердикт. Всё, что меняет картинку,
 * собрано в одном месте — заказчик крутит здесь и сразу видит результат ниже.
 */
export const ControlPanel: FC<ControlPanelProps> = ({
    leadPct,
    dealPct,
    presets,
    activePresetId,
    verdict,
    onLeadChange,
    onDealChange,
    onApplyPreset,
    compact = false,
    className,
}) => (
    <GlassCard
        id={DIALS_ANCHOR}
        intensity="strong"
        className={cn(
            'scroll-mt-24 rounded-2xl p-4 sm:p-5',
            // Подсветка, когда пришли сюда из теории.
            'data-[highlighted=true]:ring-primary data-[highlighted=true]:ring-offset-background data-[highlighted=true]:ring-4 data-[highlighted=true]:ring-offset-2',
            className,
        )}
    >
        <div
            className={cn(
                'grid gap-5',
                compact
                    ? 'lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'
                    : 'lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]',
            )}
        >
            <div className="flex flex-col gap-4">
                {/*
                 * Кнопок «заполнить» и «сбросить» здесь нет: они действуют на
                 * всю страницу, а не на эти крутилки, и потому живут наверху.
                 */}
                <p className="text-primary text-xs font-bold tracking-widest uppercase">
                    Где ведётся работа
                </p>

                <DualDial
                    leadPct={leadPct}
                    dealPct={dealPct}
                    onLeadChange={onLeadChange}
                    onDealChange={onDealChange}
                />

                <PresetChips
                    presets={presets}
                    activeId={activePresetId}
                    onApply={onApplyPreset}
                />
            </div>

            <VerdictLine
                verdict={verdict}
                compact={compact}
                className="self-start"
            />
        </div>
    </GlassCard>
);
