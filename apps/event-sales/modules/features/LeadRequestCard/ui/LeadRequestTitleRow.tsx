'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

interface LeadRequestTitleRowProps {
    title: string;
    questUrl: string | null;
    regNumber: string | null;
}

/** Название лида + ссылка «Оценка» (всегда в соседней вкладке) + код партнёра. */
export const LeadRequestTitleRow: FC<LeadRequestTitleRowProps> = ({
    title,
    questUrl,
    regNumber,
}) => (
    <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-medium">
                {title}
            </span>
            {questUrl && (
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 gap-1 px-2 text-xs"
                >
                    <a href={questUrl} target="_blank" rel="noreferrer">
                        {LEAD_REQUEST_TEXT.questLink}
                        <ExternalLink className="size-3" />
                    </a>
                </Button>
            )}
        </div>
        {regNumber && (
            <p className="text-xs text-muted-foreground">
                {LEAD_REQUEST_TEXT.partnerCode}: {regNumber}
            </p>
        )}
    </div>
);
