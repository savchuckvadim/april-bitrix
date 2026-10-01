'use client';

import { FC } from 'react';
import { CLIENT_WORK_TEXT } from '../../lib/client-work-text';
import type { ClientWorkView } from '../../lib/hooks/use-client-work';

export interface ClientWorkNotesProps {
    view: ClientWorkView;
}

/**
 * Что проверить до присоединения (два менеджера, разные ИНН), как вели
 * клиента и подсказка сервера (одна сделка, нет прав).
 */
export const ClientWorkNotes: FC<ClientWorkNotesProps> = ({ view }) => (
    <div className="space-y-1">
        {view.notes.map(note => (
            <p
                key={note}
                className="rounded-md border border-warning/50 bg-warning/5 p-2 text-xs text-foreground"
            >
                {note}
            </p>
        ))}
        {view.howWorked && (
            <p className="text-xs text-muted-foreground">
                {CLIENT_WORK_TEXT.howWorked} {view.howWorked}
            </p>
        )}
        {view.hint && (
            <p className="text-xs text-muted-foreground">{view.hint}</p>
        )}
    </div>
);
