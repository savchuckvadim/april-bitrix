'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { StatusTone } from '@workspace/april-ui/tones';
import type { CallPageObjectionDto } from '@/modules/entities/call-page';
import { CallShowInTextButton } from './CallShowInTextButton';

interface CallObjectionsCardProps {
    objections: CallPageObjectionDto[];
    onOpenHighlight: (id: string | null) => void;
}

const handledBadge = (
    handled: boolean | null,
): { tone: StatusTone; text: string } | null => {
    if (handled === null) return null;
    return handled
        ? { tone: 'success', text: 'Отработано' }
        : { tone: 'destructive', text: 'Не отработано' };
};

/** Возражения клиента: что сказал, как ответил менеджер, чем закончилось. */
export const CallObjectionsCard = ({
    objections,
    onOpenHighlight,
}: CallObjectionsCardProps) => {
    if (objections.length === 0) return null;
    return (
        <SectionCard title="Возражения">
            <ul className="space-y-3 text-sm">
                {objections.map((objection, position) => {
                    const badge = handledBadge(objection.handled);
                    return (
                        <li
                            key={`${position}-${objection.text}`}
                            className="space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-medium">
                                    {objection.categoryTitle}: {objection.text}
                                </h3>
                                {badge && (
                                    <ToneBadge tone={badge.tone} variant="soft">
                                        {badge.text}
                                    </ToneBadge>
                                )}
                            </div>
                            {objection.quote && (
                                <p className="text-muted-foreground">
                                    «{objection.quote}»
                                </p>
                            )}
                            {objection.handling && (
                                <p>
                                    <span className="font-medium text-muted-foreground">
                                        Ответ менеджера:{' '}
                                    </span>
                                    {objection.handling}
                                </p>
                            )}
                            {objection.outcomeTitle && (
                                <p>
                                    <span className="font-medium text-muted-foreground">
                                        Чем закончилось:{' '}
                                    </span>
                                    {objection.outcomeTitle}
                                </p>
                            )}
                            <CallShowInTextButton
                                highlightId={objection.highlightId}
                                onOpen={onOpenHighlight}
                            />
                        </li>
                    );
                })}
            </ul>
        </SectionCard>
    );
};
