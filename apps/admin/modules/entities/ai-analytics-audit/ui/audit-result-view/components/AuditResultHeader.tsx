import {
    AUDIT_SOURCE_LABEL,
    AUDIT_TEXT,
} from '../../../consts/ai-analytics-audit.const';
import {
    formatAuditDateTime,
    formatAuditWindow,
} from '../../../lib/audit-format.util';
import type { AiAnalyticsAuditResult } from '../../../model';

interface AuditResultHeaderProps {
    result: AiAnalyticsAuditResult;
}

/** Шапка результата: домен, когда сформирован, окно, пояс, источник. */
export const AuditResultHeader = ({ result }: AuditResultHeaderProps) => (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
            <dt className="text-xs text-muted-foreground">{AUDIT_TEXT.portal}</dt>
            <dd className="font-medium">{result.domain}</dd>
        </div>
        <div>
            <dt className="text-xs text-muted-foreground">
                {AUDIT_TEXT.resultGeneratedAt}
            </dt>
            <dd className="font-medium">
                {formatAuditDateTime(result.generatedAt)}
            </dd>
        </div>
        <div>
            <dt className="text-xs text-muted-foreground">
                {AUDIT_TEXT.resultWindow}
            </dt>
            <dd className="font-medium">
                {formatAuditWindow(result.report.meta.months)}
            </dd>
        </div>
        <div>
            <dt className="text-xs text-muted-foreground">
                {AUDIT_TEXT.resultMonths}
            </dt>
            <dd className="font-medium">{result.months}</dd>
        </div>
        <div>
            <dt className="text-xs text-muted-foreground">
                {AUDIT_TEXT.resultTimeZone}
            </dt>
            <dd className="font-medium">{result.timeZone}</dd>
        </div>
        <div>
            <dt className="text-xs text-muted-foreground">
                {AUDIT_TEXT.resultSource}
            </dt>
            <dd className="font-medium">{AUDIT_SOURCE_LABEL[result.source]}</dd>
        </div>
    </dl>
);
