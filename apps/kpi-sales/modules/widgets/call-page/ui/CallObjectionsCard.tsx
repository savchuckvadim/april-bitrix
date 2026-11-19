'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import type { CallPageObjectionDto } from '@/modules/entities/call-page';
import { CallObjectionRow } from './CallObjectionRow';

interface CallObjectionsCardProps {
    objections: CallPageObjectionDto[];
    onOpenHighlight: (id: string | null) => void;
}

/** Возражения клиента: что сказал, как ответил менеджер, чем закончилось. */
export const CallObjectionsCard = ({
    objections,
    onOpenHighlight,
}: CallObjectionsCardProps) => {
    if (objections.length === 0) return null;
    return (
        <SectionCard title="Возражения">
            <ul className="space-y-3 text-sm">
                {objections.map((objection, position) => (
                    <CallObjectionRow
                        key={`${position}-${objection.text}`}
                        objection={objection}
                        onOpenHighlight={onOpenHighlight}
                    />
                ))}
            </ul>
        </SectionCard>
    );
};
