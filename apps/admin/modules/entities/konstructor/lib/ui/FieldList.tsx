'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';

/** Одна строка «поле → значение» на странице деталей. */
export interface FieldRow {
    label: string;
    value: React.ReactNode;
}

/** Привести произвольное значение поля к читаемому виду (bool/пусто/дата). */
export function formatFieldValue(value: unknown): React.ReactNode {
    if (typeof value === 'boolean') {
        return (
            <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'да' : 'нет'}
            </Badge>
        );
    }
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }
    return String(value);
}

/** Read-only список пар «поле → значение» в две колонки. */
export function FieldList({ rows }: { rows: FieldRow[] }) {
    return (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {rows.map((row, i) => (
                <div
                    key={`${row.label}-${i}`}
                    className="flex flex-col border-b py-1.5"
                >
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}
