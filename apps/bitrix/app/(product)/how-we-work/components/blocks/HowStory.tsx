import React from 'react';
import { renderInline } from '../../lib/render-inline';

interface HowStoryProps {
    /** Ярлык примера, например «Сквозной пример · фаза 1» */
    tag: string;
    text: string;
}

/** Блок сквозного примера-истории. */
export const HowStory: React.FC<HowStoryProps> = ({ tag, text }) => (
    <div className="rounded-r-xl border border-l-4 border-l-primary bg-card px-5 py-4">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary">
            {tag}
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
            {renderInline(text)}
        </p>
    </div>
);
