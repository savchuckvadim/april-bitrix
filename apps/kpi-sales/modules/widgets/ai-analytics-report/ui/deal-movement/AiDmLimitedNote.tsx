'use client';

import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    aiDmPerGroupText,
    type AiDmLimitedNote as AiDmLimitedNoteView,
} from '../../lib/deal-movement/ai-deal-movement-deals.util';

const T = AI_DEAL_MOVEMENT_TEXT.deals;

interface AiDmLimitedNoteProps {
    note: AiDmLimitedNoteView;
    perGroup: number;
}

/** «Показаны 30 из 48» по группам менеджер × статус, где в список вошли не все. */
export const AiDmLimitedNote = ({ note, perGroup }: AiDmLimitedNoteProps) =>
    note.lines.length ? (
        <div className="space-y-1 rounded-md border border-dashed p-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{T.limitedTitle}</p>
            <p>{aiDmPerGroupText(perGroup)}</p>
            <ul className="space-y-0.5">
                {note.lines.map(line => (
                    <li key={line}>{line}</li>
                ))}
                {note.rest > 0 && <li>{T.limitedMore(note.rest)}</li>}
            </ul>
        </div>
    ) : null;
