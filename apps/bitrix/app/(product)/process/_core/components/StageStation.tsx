'use client';

import type { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Lock } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_DOT, ACTOR_LABEL } from '../lib/actor.util';
import {
    BOTH_RING_BACKGROUND,
    BOTH_STRIPES_BACKGROUND,
    OWNER_CARD_CLASS,
    OWNER_RING_CLASS,
} from '../lib/owner.util';
import type { StageView } from '../types';

interface StageStationProps {
    view: StageView;
    /** Порядковый номер для stagger-анимации. */
    order: number;
    onSelect: (view: StageView) => void;
}

/** Станция на рельсе + карточка стадии под ней. */
export const StageStation: FC<StageStationProps> = ({
    view,
    order,
    onSelect,
}) => {
    const prefersReduced = useReducedMotion();
    const { stage, owner, actor } = view;
    const isBoth = owner === 'both';

    return (
        <motion.div
            className="flex h-full min-w-0 flex-col items-center"
            initial={false}
            animate={{ opacity: owner === 'none' ? 0.6 : 1 }}
            transition={
                prefersReduced
                    ? { duration: 0 }
                    : { delay: order * 0.02, duration: 0.25 }
            }
        >
            <span
                aria-hidden
                className={cn(
                    'bg-background relative z-10 flex size-7 items-center justify-center rounded-full border-[3px]',
                    OWNER_RING_CLASS[owner],
                )}
                style={
                    isBoth ? { background: BOTH_RING_BACKGROUND } : undefined
                }
            >
                <span
                    className={cn(
                        'size-2 rounded-full',
                        isBoth ? 'bg-background' : ACTOR_DOT[actor],
                    )}
                />
            </span>

            <button
                type="button"
                onClick={() => onSelect(view)}
                aria-label={`${stage.label} — подробнее о шаге`}
                title="Открыть подробности шага"
                className="focus-visible:outline-primary group mt-2 w-full min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-2"
            >
                <GlassCard
                    intensity="soft"
                    className={cn(
                        'relative h-full overflow-hidden rounded-xl border p-2.5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md',
                        OWNER_CARD_CLASS[owner],
                    )}
                >
                    {isBoth && (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0"
                            style={{ background: BOTH_STRIPES_BACKGROUND }}
                        />
                    )}

                    <p className="text-foreground relative flex items-start gap-1 text-sm leading-tight font-bold text-balance">
                        <span className="min-w-0 flex-1">{stage.label}</span>

                        {view.writesKpi && (
                            <BarChart3
                                className="text-success mt-0.5 h-3 w-3 shrink-0"
                                aria-label="пишется событие KPI"
                            />
                        )}
                        {view.isBlockedForLead && (
                            <Lock
                                className="text-warning mt-0.5 h-3 w-3 shrink-0"
                                aria-label="регламент не пускает сюда лид"
                            />
                        )}
                    </p>

                    <p className="text-muted-foreground relative mt-1 text-[11px] leading-snug">
                        {stage.hint}
                    </p>

                    {/*
                     * Владельца стадии здесь НЕ подписываем: при десяти
                     * колонках подпись обрезается, а сама информация уже
                     * закодирована полосами покрытия, цветом рамки и штриховкой
                     * «оба контура». Текстом остаётся только исполнитель.
                     */}
                    <p className="relative mt-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase">
                        <span
                            className={cn(
                                'size-1.5 shrink-0 rounded-full',
                                ACTOR_DOT[actor],
                            )}
                            aria-hidden
                        />
                        <span className="text-muted-foreground truncate">
                            {ACTOR_LABEL[actor]}
                        </span>
                    </p>
                </GlassCard>
            </button>
        </motion.div>
    );
};
