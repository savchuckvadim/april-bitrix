'use client';

interface SetSummaryProps {
    label: string;
    summary: string;
}

/** «Набор N · Всего наименований K на сумму X ₽…» */
export const SetSummary = ({ label, summary }: SetSummaryProps) => (
    <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{label}</span>
        <span>{summary}</span>
    </div>
);
