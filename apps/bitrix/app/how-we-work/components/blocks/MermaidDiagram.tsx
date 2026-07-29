'use client';

import React from 'react';
import { useMermaidRender } from '../../hooks/use-mermaid-render';

interface MermaidDiagramProps {
    /** Текст диаграммы в синтаксисе mermaid */
    chart: string;
}

/** Отрисовка mermaid-диаграммы; при ошибке парсинга показывает исходник. */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const { containerRef, error } = useMermaidRender(chart);

    if (error) {
        return (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {chart}
            </pre>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        />
    );
};
