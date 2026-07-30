import React from 'react';
import { MermaidDiagram } from './MermaidDiagram';

interface HowDiagramProps {
    chart: string;
    caption?: string;
}

/** Карточка с mermaid-схемой и подписью. */
export const HowDiagram: React.FC<HowDiagramProps> = ({ chart, caption }) => (
    <figure className="rounded-xl border bg-card p-4 sm:p-6 overflow-x-auto">
        <MermaidDiagram chart={chart} />
        {caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">
                {caption}
            </figcaption>
        )}
    </figure>
);
