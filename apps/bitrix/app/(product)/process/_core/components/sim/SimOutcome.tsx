'use client';

import type { FC } from 'react';
import { RotateCcw, Trophy, XCircle } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { SimStatus } from '../../lib/simulator.util';

interface SimOutcomeProps {
    status: Extract<SimStatus, 'sale' | 'fail'>;
    company: string;
    steps: number;
    onRestart: () => void;
}

/** Итог прохождения: продажа или отказ. */
export const SimOutcome: FC<SimOutcomeProps> = ({
    status,
    company,
    steps,
    onRestart,
}) => {
    const isSale = status === 'sale';
    const Icon = isSale ? Trophy : XCircle;

    return (
        <GlassCard
            intensity="liquid"
            className={cn(
                'rounded-2xl border-2 p-5',
                isSale ? 'border-success/50' : 'border-destructive/50',
            )}
        >
            <p
                className={cn(
                    'flex items-center gap-2 text-lg font-bold',
                    isSale ? 'text-success' : 'text-destructive',
                )}
            >
                <Icon className="size-5" aria-hidden />
                {isSale
                    ? `Продажа. ${company || 'Клиент'} — ваш.`
                    : `Отказ. ${company || 'Клиент'} уходит в буфер отказников.`}
            </p>

            <p className="text-muted-foreground mt-2 text-sm">
                {isSale
                    ? 'Путь занял ' +
                      steps +
                      ' шагов. Сделка закрыта: приложение и хуки её больше не ведут, дальше — только постпродажный тип «Поставка».'
                    : 'Путь занял ' +
                      steps +
                      ' шагов. Компанию сможет взять другой менеджер — история работы и причина отказа останутся в карточке.'}
            </p>

            <Button
                variant="outline"
                onClick={onRestart}
                className="mt-4 gap-1.5"
            >
                <RotateCcw className="size-4" />
                Пройти заново
            </Button>
        </GlassCard>
    );
};
