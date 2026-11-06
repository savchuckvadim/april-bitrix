'use client';

import { AiOwnerReportSourceBadge } from './AiOwnerReportSection';

interface AiOwnerReportSummaryProps {
    paragraphs: string[];
    source: 'template' | 'model';
}

/** Резюме для собственника: абзацы и кто их написал. */
export const AiOwnerReportSummary = ({ paragraphs, source }: AiOwnerReportSummaryProps) => (
    <div className="space-y-2">
        {paragraphs.map((paragraph, index) => (
            <p
                key={paragraph}
                className={index === 0 ? 'text-sm font-medium' : 'text-sm'}
            >
                {paragraph}
            </p>
        ))}
        <AiOwnerReportSourceBadge source={source} />
    </div>
);
