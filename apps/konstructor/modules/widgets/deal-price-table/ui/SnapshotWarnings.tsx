'use client';

import { AlertTriangle } from 'lucide-react';

/** Замечания восстановленного слепка: сохранённые цены показываются как есть. */
export const SnapshotWarnings = ({ warnings }: { warnings: string[] }) => {
    if (!warnings.length) return null;

    return (
        <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-xs text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
                <div className="mb-1 font-semibold">
                    Сделка восстановлена с замечаниями:
                </div>
                {warnings.map(warning => (
                    <div key={warning}>{warning}</div>
                ))}
            </div>
        </div>
    );
};
