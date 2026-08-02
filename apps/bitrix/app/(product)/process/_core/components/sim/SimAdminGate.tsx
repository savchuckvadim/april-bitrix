'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { ArrowRight, ScanSearch, ShieldQuestion } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { SimGateOutcome } from '../../lib/simulator.util';

interface SimAdminGateProps {
    company: string;
    /** Кто разбирает вход при текущих ответах. */
    actorLabel: string;
    onPass: (outcome: SimGateOutcome) => void;
}

const OUTCOMES: {
    code: SimGateOutcome;
    label: string;
    meaning: string;
    share: string;
    tone: 'good' | 'neutral' | 'warn';
}[] = [
    {
        code: 'identified',
        label: 'Компания определена',
        meaning:
            'Нашли по реквизитам или уточнили звонком. Менеджер получит клиента разобранным.',
        share: 'девять из десяти',
        tone: 'good',
    },
    {
        code: 'unknown',
        label: 'Определить не удалось',
        meaning:
            'Бывает: телефон общий, ИНН не назвали, на сайте пусто. Сделка всё равно заводится — без компании.',
        share: 'примерно один из десяти',
        tone: 'neutral',
    },
    {
        code: 'duplicate',
        label: 'Это дубль',
        meaning:
            'С компанией уже работают. Сам не решаю — несу руководителю: забрать или оставить, решает он.',
        share: 'редко, но дороже всего',
        tone: 'warn',
    },
];

const TONE: Record<'good' | 'neutral' | 'warn', string> = {
    good: 'border-success/60 bg-success/10 text-success',
    neutral: 'border-primary/60 bg-primary/10 text-primary',
    warn: 'border-warning/60 bg-warning/10 text-warning',
};

/**
 * Экран разбора входа — рабочее место администратора, а не менеджера.
 *
 * Формы «Звонки» здесь нет намеренно: при рекомендованной схеме приложение
 * живёт в сделке, а вход разбирают в лиде. Показать администратору форму
 * менеджера значило бы нарисовать интерфейс, которого у него не существует.
 */
export const SimAdminGate: FC<SimAdminGateProps> = ({
    company,
    actorLabel,
    onPass,
}) => {
    const [chosen, setChosen] = useState<SimGateOutcome | null>(null);

    return (
        <GlassCard intensity="soft" className="rounded-2xl border p-4">
            <h3 className="text-foreground flex items-center gap-2 font-bold">
                <ScanSearch className="text-info size-4" aria-hidden />
                Разбор входа
                <span className="text-muted-foreground text-sm font-normal">
                    — {actorLabel.toLowerCase()}, в лиде
                </span>
            </h3>

            <div className="bg-card mt-3 rounded-xl border p-3">
                <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                    Автопроверка на дубли
                </p>
                <p className="text-foreground/90 mt-1 text-sm">
                    По телефону и почте совпадений не нашлось.
                </p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    Проверка предварительная: одинаковый телефон бывает у
                    бизнес-центра, разные — у филиалов одной компании. Машина
                    только подсказывает.
                </p>
            </div>

            <p className="text-foreground mt-4 flex items-center gap-2 text-sm font-semibold">
                <ShieldQuestion className="text-info size-4" aria-hidden />
                Что за компания стоит за {company || 'этим лидом'}?
            </p>

            <div className="mt-2 space-y-2">
                {OUTCOMES.map(outcome => (
                    <button
                        key={outcome.code}
                        type="button"
                        onClick={() => setChosen(outcome.code)}
                        aria-pressed={chosen === outcome.code}
                        className={cn(
                            'focus-visible:outline-primary block w-full cursor-pointer rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2',
                            chosen === outcome.code
                                ? TONE[outcome.tone]
                                : 'hover:border-primary/50 text-muted-foreground',
                        )}
                    >
                        <span className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold">
                                {outcome.label}
                            </span>
                            <span className="text-[11px] opacity-80">
                                {outcome.share}
                            </span>
                        </span>
                        <span className="text-foreground/80 mt-1 block text-xs leading-relaxed">
                            {outcome.meaning}
                        </span>
                    </button>
                ))}
            </div>

            <Button
                disabled={chosen === null}
                onClick={() => chosen && onPass(chosen)}
                className="mt-4 w-full gap-1.5"
            >
                {chosen === 'duplicate'
                    ? 'Отдать руководителю'
                    : 'Передать менеджеру'}
                <ArrowRight className="size-4" />
            </Button>
        </GlassCard>
    );
};
