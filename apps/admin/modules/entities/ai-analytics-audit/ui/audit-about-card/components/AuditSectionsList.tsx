import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import type { AiAnalyticsAuditAboutSection } from '../../../model';

interface AuditSectionsListProps {
    sections: readonly AiAnalyticsAuditAboutSection[];
}

/** Нумерованные разделы отчёта с правилом чтения каждого. */
export const AuditSectionsList = ({ sections }: AuditSectionsListProps) => (
    <div className="space-y-1.5">
        <h4 className="text-sm font-semibold">{AUDIT_TEXT.aboutSections}</h4>
        <ol className="space-y-1.5 text-sm">
            {sections.map(section => (
                <li key={section.order} className="flex gap-2">
                    <span className="w-5 shrink-0 text-right font-medium tabular-nums">
                        {section.order}.
                    </span>
                    <span>
                        <span className="font-medium">{section.title}</span>
                        <span className="text-muted-foreground">
                            {' — '}
                            {section.howToRead}
                        </span>
                    </span>
                </li>
            ))}
        </ol>
    </div>
);
