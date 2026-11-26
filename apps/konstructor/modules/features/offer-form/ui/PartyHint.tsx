'use client';

import { Info } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';

export interface PartyHintProps {
    /** Заголовок подсказки: о чём она */
    label: string;
    text: string;
}

/** Второстепенное пояснение к карточке или полю: значок, текст — в подсказке. */
export const PartyHint = ({ label, text }: PartyHintProps) => (
    <HintTooltip title={label} lines={[text]} align="end">
        <span
            tabIndex={0}
            role="img"
            aria-label={`${label}: ${text}`}
            className="inline-flex cursor-help rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
            <Info className="size-3.5" aria-hidden />
        </span>
    </HintTooltip>
);
