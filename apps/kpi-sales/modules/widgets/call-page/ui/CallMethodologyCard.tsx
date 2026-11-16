'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { StatusTone } from '@workspace/april-ui/tones';
import type {
    CallPageCheckpointDto,
    CallPageMethodologyDto,
} from '@/modules/entities/call-page';
import { CallShowInTextButton } from './CallShowInTextButton';

interface CallMethodologyCardProps {
    methodology: CallPageMethodologyDto | null;
    onOpenHighlight: (id: string | null) => void;
}

const STATUS_TONE: Record<CallPageCheckpointDto['status'], StatusTone> = {
    done: 'success',
    missed: 'destructive',
    not_applicable: 'muted',
};

/** Проверка звонка по методике продаж портала: пункты, статусы, цитаты. */
export const CallMethodologyCard = ({
    methodology,
    onOpenHighlight,
}: CallMethodologyCardProps) => {
    if (methodology === null) return null;
    return (
        <SectionCard
            title={methodology.title}
            description={`Выполнено пунктов: ${methodology.checkpointsDone} из ${methodology.checkpointsTotal}`}
        >
            <div className="space-y-3 text-sm">
                {methodology.spiralsNote && (
                    <p className="text-muted-foreground">
                        {methodology.spiralsNote}
                    </p>
                )}
                <ul className="space-y-2">
                    {methodology.checkpoints.map((checkpoint, position) => (
                        <li
                            key={`${position}-${checkpoint.title}`}
                            className="space-y-1"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <ToneBadge
                                    size="sm"
                                    variant="soft"
                                    tone={STATUS_TONE[checkpoint.status]}
                                >
                                    {checkpoint.statusTitle}
                                </ToneBadge>
                                <span>{checkpoint.title}</span>
                                {checkpoint.mandatory && (
                                    <span className="text-xs text-muted-foreground">
                                        обязательный
                                    </span>
                                )}
                            </div>
                            {checkpoint.quote && (
                                <p className="text-muted-foreground">
                                    «{checkpoint.quote}»
                                </p>
                            )}
                            <CallShowInTextButton
                                highlightId={checkpoint.highlightId}
                                onOpen={onOpenHighlight}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </SectionCard>
    );
};
