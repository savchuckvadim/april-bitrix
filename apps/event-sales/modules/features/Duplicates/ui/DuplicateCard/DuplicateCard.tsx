'use client';

import { FC } from 'react';
import { Building2, Handshake, UserRound, Users } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    DUPLICATE_ENTITY_TYPE,
    type DuplicateCandidate,
    type DuplicateEntityType,
} from '../../model';
import {
    ENTITY_TYPE_LABEL,
    candidateConfidence,
    candidateTitle,
    candidateTone,
    reasonLabel,
    reasonTone,
} from '../../lib/candidate-view';

const ENTITY_ICON: Record<DuplicateEntityType, typeof Building2> = {
    [DUPLICATE_ENTITY_TYPE.LEAD]: UserRound,
    [DUPLICATE_ENTITY_TYPE.CONTACT]: Users,
    [DUPLICATE_ENTITY_TYPE.COMPANY]: Building2,
    [DUPLICATE_ENTITY_TYPE.DEAL]: Handshake,
};

interface DuplicateCardProps {
    candidate: DuplicateCandidate;
    onOpen: (candidate: DuplicateCandidate) => void;
}

/**
 * Свёрнутая карточка кандидата.
 *
 * Содержит всё, что нужно для решения «это наш клиент или нет», без открытия
 * подробностей: тип, название, уверенность и чем именно совпало. Подробности
 * (кто ответственный, какие сделки) — по клику, чтобы узкая колонка не
 * превращалась в простыню.
 */
export const DuplicateCard: FC<DuplicateCardProps> = ({
    candidate,
    onOpen,
}) => {
    const Icon = ENTITY_ICON[candidate.entityType];
    const tone = candidateTone(candidate);
    // Двух причин достаточно: третья уже не меняет решения, а место съедает.
    const reasons = candidate.reasons.slice(0, 2);
    const restCount = candidate.reasons.length - reasons.length;

    return (
        <button
            type="button"
            onClick={() => onOpen(candidate)}
            className={cn(
                'w-full cursor-pointer rounded-md border border-border bg-card p-2 text-left',
                'transition-colors hover:border-muted-foreground/40 hover:bg-accent/40',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            )}
        >
            <div className="flex items-start gap-2">
                <Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                            {candidateTitle(candidate)}
                        </span>
                        <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                            {ENTITY_TYPE_LABEL[candidate.entityType]} ·{' '}
                            {candidate.id}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                        <ToneBadge tone={tone} variant="soft" size="sm">
                            {candidateConfidence(candidate)}
                        </ToneBadge>
                        {reasons.map(reason => (
                            <ToneBadge
                                key={`${reason.kind}-${reason.value}`}
                                tone={reasonTone(reason)}
                                variant="outline"
                                size="sm"
                            >
                                {reasonLabel(reason)}
                            </ToneBadge>
                        ))}
                        {restCount > 0 && (
                            <span className="text-[0.6875rem] text-muted-foreground">
                                +{restCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};
