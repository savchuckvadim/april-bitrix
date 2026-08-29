'use client';

import { Check } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type {
    QuestionnaireCodeOption,
    QuestionnairePurpose,
} from '../../../model';

interface QuestionnairePurposeCardsProps {
    /** Назначения из реестра `GET /schema`. */
    purposes: QuestionnaireCodeOption<QuestionnairePurpose>[];
    value: QuestionnairePurpose;
    onChange: (purpose: QuestionnairePurpose) => void;
}

/**
 * Назначение анкеты — карточками, а не строкой селекта.
 *
 * Это первое и самое дорогое решение владельца: анкета для ПЛАНИРОВАНИЯ
 * спрашивает, что менеджер собирается узнать, а анкета для ОТЧЁТНОСТИ — что
 * он узнал. От назначения зависят и колонка показа, и то, какие условия
 * вообще имеют смысл, поэтому выбор виден целиком, вместе с пояснением
 * каждого варианта.
 *
 * Названия и пояснения берутся из реестра — админка их не сочиняет.
 */
export const QuestionnairePurposeCards = ({
    purposes,
    value,
    onChange,
}: QuestionnairePurposeCardsProps) => (
    <div className="grid gap-3 sm:grid-cols-2">
        {purposes.map(purpose => {
            const isActive = purpose.code === value;
            return (
                <button
                    key={purpose.code}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onChange(purpose.code)}
                    className={cn(
                        'rounded-lg border p-4 text-left transition-colors',
                        isActive
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50',
                    )}
                >
                    <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold uppercase tracking-wide">
                            {purpose.name}
                        </span>
                        {isActive && <Check className="h-4 w-4 text-primary" />}
                    </span>
                    {purpose.description && (
                        <span className="mt-1 block text-sm text-muted-foreground">
                            {purpose.description}
                        </span>
                    )}
                </button>
            );
        })}
    </div>
);
