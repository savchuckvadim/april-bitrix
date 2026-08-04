'use client';

import type { FC } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { SimAnchor, SimHint } from '../../constants/sim-hints';

interface SimGuideProps {
    /** Слот, в котором рисуем. Карточка появится только в своём. */
    anchor: SimAnchor;
    hint: SimHint | null;
    text: string;
    onDismiss: () => void;
    className?: string;
}

/** Общий layoutId: он и заставляет карточку ПЕРЕЛЕТАТЬ между слотами. */
const LAYOUT_ID = 'sim-guide-card';

/**
 * Карточка-гид: объясняет, почему вы видите этот экран и чего от вас ждут.
 *
 * Живёт не в портале, а внутри того блока, о котором говорит. Причина
 * техническая и жёсткая: на `<main>` висит CSS `zoom`, и любой портал в body
 * оказался бы вне зумированного поддерева — координаты разъехались бы. Слот
 * снимает вопрос позиционирования целиком.
 *
 * Один и тот же `layoutId` в разных слотах даёт эффект переезда: framer-motion
 * сам анимирует карточку из старого места в новое. Тот же приём, что у
 * приложения «Звонки» на схеме (`CallsPlacement`).
 *
 * Движения ровно столько, сколько нужно, чтобы заметить переезд: пружина без
 * перелёта, появление масштабом и блюром вместе — материал прибывает, а не
 * проявляется из ниоткуда. При `prefers-reduced-motion` перелёт выключается
 * совсем и остаётся кросс-фейд.
 */
export const SimGuide: FC<SimGuideProps> = ({
    anchor,
    hint,
    text,
    onDismiss,
    className,
}) => {
    const prefersReduced = useReducedMotion();
    const isHere = hint?.anchor === anchor;

    return (
        <AnimatePresence>
            {isHere && hint && (
                <motion.aside
                    key={hint.id}
                    layoutId={prefersReduced ? undefined : LAYOUT_ID}
                    initial={
                        prefersReduced
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.96, filter: 'blur(6px)' }
                    }
                    animate={
                        prefersReduced
                            ? { opacity: 1 }
                            : { opacity: 1, scale: 1, filter: 'blur(0px)' }
                    }
                    exit={
                        prefersReduced
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.96, filter: 'blur(6px)' }
                    }
                    transition={
                        prefersReduced
                            ? { duration: 0.15 }
                            : { type: 'spring', bounce: 0, duration: 0.35 }
                    }
                    className={cn(
                        'border-primary/40 bg-card/80 relative mb-3 rounded-xl border p-3 shadow-sm backdrop-blur',
                        className,
                    )}
                >
                    <p className="text-foreground pr-6 text-sm font-semibold">
                        {hint.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {text}
                    </p>

                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Понятно, скрыть подсказку"
                        title="Понятно"
                        className="text-muted-foreground hover:text-foreground focus-visible:outline-primary absolute top-2.5 right-2.5 cursor-pointer rounded focus-visible:outline-2"
                    >
                        <X className="size-4" />
                    </button>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};
