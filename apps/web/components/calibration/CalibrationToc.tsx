import React from 'react';
import type { CalibrationSection } from '@/lib/calibration/types';

interface CalibrationTocProps {
    sections: CalibrationSection[];
}

/**
 * Оглавление разделов. На мобильном — обычный список над контентом,
 * от 1024px — колонка сбоку, липкая при прокрутке (`sticky`, не `fixed`).
 */
export const CalibrationToc: React.FC<CalibrationTocProps> = ({ sections }) => (
    <nav
        aria-label="Разделы страницы"
        className="mb-10 lg:mb-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto"
    >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Содержание
        </p>
        <ol className="space-y-1">
            {sections.map((section, index) => (
                <li key={section.id}>
                    <a
                        href={`#${section.id}`}
                        title={section.summary}
                        className="group flex gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="tabular-nums text-muted-foreground/70">
                            {index + 1}.
                        </span>
                        <span className="min-w-0">{section.title}</span>
                    </a>
                </li>
            ))}
        </ol>
    </nav>
);
