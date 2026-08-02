'use client';

import type { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALLS_ABILITIES_IN_DEAL,
    CALLS_ABILITIES_IN_LEAD,
} from '../copy/calls-abilities';
import type { CallsAppPlacement } from '../types';
import { CallsAppBadge } from './CallsAppBadge';
import { CallsSlot } from './CallsSlot';

interface CallsPlacementProps {
    placement: CallsAppPlacement;
    className?: string;
}

/**
 * Где при текущих настройках физически стоит форма «Звонки».
 *
 * Это самый частый вопрос заказчика: «а где менеджер будет работать?». Карточка
 * перелетает между лидом и сделкой, а при перекрытии раздваивается — форма одна
 * и та же, но открыть её можно из двух мест.
 */
export const CallsPlacement: FC<CallsPlacementProps> = ({
    placement,
    className,
}) => (
    <section className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-baseline gap-3">
            <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                Рабочее место менеджера
            </h2>
            {placement.isSplit && (
                <p className="text-warning text-xs">
                    форма одна — открывается из двух мест и сама сводит статусы
                </p>
            )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
            <CallsSlot
                entityLabel="лида"
                accentClass="border-event-lead/50 bg-event-lead/5"
                isActive={placement.inLead}
            >
                <AnimatePresence>
                    {placement.inLead && (
                        <CallsAppBadge
                            abilities={CALLS_ABILITIES_IN_LEAD}
                            layoutId="calls-app-lead"
                        />
                    )}
                </AnimatePresence>
            </CallsSlot>

            <CallsSlot
                entityLabel="сделки"
                accentClass="border-primary/50 bg-primary/5"
                isActive={placement.inDeal}
            >
                <AnimatePresence>
                    {placement.inDeal && (
                        <CallsAppBadge
                            abilities={CALLS_ABILITIES_IN_DEAL}
                            layoutId="calls-app-deal"
                        />
                    )}
                </AnimatePresence>
            </CallsSlot>
        </div>
    </section>
);
