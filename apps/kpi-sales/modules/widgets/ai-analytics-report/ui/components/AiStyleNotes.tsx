'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { ToneBadge } from '@workspace/april-ui';
import type { AiStyleCard } from '@/modules/entities/ai-analytics';
import {
    AI_STYLE_STALE_TEXT,
    aiStyleProfileNote,
    aiStyleStatusNote,
} from '../../lib/ai-style.util';

interface AiStyleNotesProps {
    card: AiStyleCard;
}

/**
 * Оговорки карточки стиля: пустое состояние (few_data / opt_out — текст
 * note бэка), оговорка готового профиля, давно не пересчитывался (stale),
 * низкое доверие профиля.
 */
export const AiStyleNotes = ({ card }: AiStyleNotesProps) => {
    const statusNote = aiStyleStatusNote(card);
    const readyNote = card.status === 'ready' ? card.note : null;
    const profileNote = aiStyleProfileNote(card.profile);
    if (!statusNote && !readyNote && !card.stale && !profileNote) return null;

    return (
        <div className="space-y-2">
            {statusNote && (
                <Alert>
                    <AlertDescription>{statusNote}</AlertDescription>
                </Alert>
            )}
            {readyNote && (
                <p className="text-xs text-muted-foreground">{readyNote}</p>
            )}
            {(card.stale || profileNote) && (
                <div className="flex flex-wrap gap-2">
                    {card.stale && (
                        <ToneBadge
                            tone="warning"
                            variant="soft"
                            size="sm"
                            title={AI_STYLE_STALE_TEXT}
                        >
                            профиль давно не пересчитывался
                        </ToneBadge>
                    )}
                    {profileNote && (
                        <ToneBadge tone="warning" variant="outline" size="sm">
                            {profileNote}
                        </ToneBadge>
                    )}
                </div>
            )}
        </div>
    );
};
