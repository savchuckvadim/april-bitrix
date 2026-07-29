import React from 'react';
import { renderInline } from '../../lib/render-inline';

interface HowNoteProps {
    tone: 'info' | 'good' | 'warn' | 'bad';
    text: string;
}

const TONE_CLASSES: Record<HowNoteProps['tone'], string> = {
    info: 'border-primary/40 bg-primary/5',
    good: 'border-success/40 bg-success/10',
    warn: 'border-warning/40 bg-warning/10',
    bad: 'border-destructive/40 bg-destructive/10',
};

/** Акцентная плашка-примечание. */
export const HowNote: React.FC<HowNoteProps> = ({ tone, text }) => (
    <div
        className={`rounded-r-xl border-l-4 px-5 py-4 text-sm leading-relaxed text-foreground/90 ${TONE_CLASSES[tone]}`}
    >
        {renderInline(text)}
    </div>
);
