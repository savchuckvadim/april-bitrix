'use client';

import { AlertTriangle } from 'lucide-react';

interface DigestWarningsProps {
    warnings: string[];
    truncated: boolean;
}

/** Некритичные проблемы сборки и признак неполных данных. */
export const DigestWarnings = ({ warnings, truncated }: DigestWarningsProps) => {
    if (!warnings.length && !truncated) return null;
    return (
        <div className="space-y-1 text-xs">
            {truncated && (
                <p className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Выгрузка дня обрезана по лимиту строк — данные неполные.
                </p>
            )}
            {warnings.map(warning => (
                <p key={warning} className="flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {warning}
                </p>
            ))}
        </div>
    );
};
