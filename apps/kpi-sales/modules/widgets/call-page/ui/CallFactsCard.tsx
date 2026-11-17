'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALL_PAGE_TEXT_CLASS,
    highlightIdOf,
    type CallPageFactDto,
} from '@/modules/entities/call-page';
import { CallShowInTextButton } from './CallShowInTextButton';

interface CallFactsCardProps {
    facts: CallPageFactDto[];
    onOpenHighlight: (id: string | null) => void;
}

/**
 * Итоги разговора: «показатель — значение», тревожное выделено цветом. У
 * потребностей, показа, цены и следующего шага — переход к месту в разговоре.
 */
export const CallFactsCard = ({ facts, onOpenHighlight }: CallFactsCardProps) => {
    if (facts.length === 0) return null;
    return (
        <SectionCard title="Итоги разговора">
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]">
                {facts.map(fact => (
                    <div key={fact.label} className="contents">
                        <dt className="text-muted-foreground">{fact.label}</dt>
                        <dd className="space-x-2">
                            {/* Чек-листы приходят несколькими строками — переносы сохраняем. */}
                            <span
                                className={cn(
                                    'whitespace-pre-line',
                                    CALL_PAGE_TEXT_CLASS[fact.tone],
                                )}
                            >
                                {fact.value}
                            </span>
                            <CallShowInTextButton
                                highlightId={highlightIdOf(fact)}
                                onOpen={onOpenHighlight}
                            />
                        </dd>
                    </div>
                ))}
            </dl>
        </SectionCard>
    );
};
