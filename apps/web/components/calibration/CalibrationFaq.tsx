import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CALIBRATION_FAQ } from '@/lib/calibration/page-content';
import { CalibrationRichText } from './CalibrationRichText';

/**
 * Частые вопросы. Нативные `details/summary`: работают без JavaScript,
 * значит открываются и в печати, и при отключённых скриптах.
 */
export const CalibrationFaq: React.FC = () => (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {CALIBRATION_FAQ.map((item, index) => (
            <details key={index} className="group px-4 py-3 sm:px-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {item.question}
                    <ChevronDown
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    />
                </summary>
                <p className="mt-3 text-foreground/90 leading-relaxed">
                    <CalibrationRichText text={item.answer} />
                </p>
            </details>
        ))}
    </div>
);
