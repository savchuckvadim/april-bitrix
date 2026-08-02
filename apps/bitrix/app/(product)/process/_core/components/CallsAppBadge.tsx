'use client';

import type { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';

interface CallsAppBadgeProps {
    /** Что менеджер может делать формой в этом месте. */
    abilities: string[];
    /** layoutId включает перелёт карточки между лидом и сделкой. */
    layoutId: string;
}

/** Карточка приложения «Звонки» внутри карточки сущности. */
export const CallsAppBadge: FC<CallsAppBadgeProps> = ({
    abilities,
    layoutId,
}) => {
    const prefersReduced = useReducedMotion();

    return (
        <motion.div
            layoutId={prefersReduced ? undefined : layoutId}
            transition={
                prefersReduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 30 }
            }
        >
            <GlassCard
                intensity="soft"
                className="border-action/50 rounded-lg border p-2.5"
            >
                <p className="text-action flex items-center gap-1.5 text-xs font-bold">
                    <PhoneCall className="h-3.5 w-3.5" aria-hidden />
                    Приложение «Звонки»
                </p>
                <ul className="text-muted-foreground mt-1.5 space-y-0.5 text-[11px] leading-snug">
                    {abilities.map(item => (
                        <li key={item}>· {item}</li>
                    ))}
                </ul>
            </GlassCard>
        </motion.div>
    );
};
