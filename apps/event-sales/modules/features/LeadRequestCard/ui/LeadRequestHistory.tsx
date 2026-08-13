'use client';

import { FC, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

interface LeadRequestHistoryProps {
    /** Записи свежими вверх (см. getHistoryNewestFirst). */
    entries: string[];
}

/** Свёртываемая история обработки заявки (append-only записи лида). */
export const LeadRequestHistory: FC<LeadRequestHistoryProps> = ({
    entries,
}) => {
    const [open, setOpen] = useState(false);
    if (!entries.length) return null;
    return (
        <div>
            <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setOpen(value => !value)}
            >
                {open
                    ? LEAD_REQUEST_TEXT.historyHide
                    : `${LEAD_REQUEST_TEXT.historyShow} (${entries.length})`}
            </Button>
            {open && (
                <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
                    {entries.map((entry, index) => (
                        <li key={`${index}-${entry}`}>{entry}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
