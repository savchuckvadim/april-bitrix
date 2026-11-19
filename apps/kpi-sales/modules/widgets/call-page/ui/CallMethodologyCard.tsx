'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import type { CallPageMethodologyDto } from '@/modules/entities/call-page';
import { CallCheckpointRow } from './CallCheckpointRow';

interface CallMethodologyCardProps {
    methodology: CallPageMethodologyDto | null;
    onOpenHighlight: (id: string | null) => void;
}

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
                        <CallCheckpointRow
                            key={`${position}-${checkpoint.title}`}
                            checkpoint={checkpoint}
                            onOpenHighlight={onOpenHighlight}
                        />
                    ))}
                </ul>
            </div>
        </SectionCard>
    );
};
