'use client';

import * as React from 'react';

/** Пара «метка: значение» в панелях деталей трёх источников. */
export function DetailLine({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex gap-1">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-mono">{value ?? '—'}</span>
        </div>
    );
}
