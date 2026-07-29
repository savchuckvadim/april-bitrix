'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

interface RowNameProps {
    displayName: string;
    isCustom: boolean;
    canEdit: boolean;
    onRename: (alternativeName: string | null) => void;
}

/** Имя строки: карандаш/даблклик → inline-правка; кастомное имя подчёркнуто */
export const RowName = ({
    displayName,
    isCustom,
    canEdit,
    onRename,
}: RowNameProps) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');

    const startEdit = () => {
        if (!canEdit) return;
        setValue(displayName);
        setEditing(true);
    };

    const commit = () => {
        setEditing(false);
        const trimmed = value.trim();
        if (trimmed && trimmed !== displayName) onRename(trimmed);
    };

    if (editing) {
        return (
            <input
                autoFocus
                className="w-full rounded border bg-background px-1 py-0.5 text-sm font-medium"
                value={value}
                onChange={event => setValue(event.target.value)}
                onBlur={commit}
                onKeyDown={event => {
                    if (event.key === 'Enter') commit();
                    if (event.key === 'Escape') setEditing(false);
                }}
            />
        );
    }

    return (
        <span
            className="flex min-w-0 items-center gap-1"
            onDoubleClick={startEdit}
        >
            <span
                className={`truncate text-sm font-medium ${
                    isCustom ? 'underline decoration-dotted' : ''
                }`}
                title={displayName}
            >
                {displayName}
            </span>
            {canEdit ? (
                <button
                    type="button"
                    onClick={startEdit}
                    aria-label="Переименовать"
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted"
                >
                    <Pencil className="h-3 w-3" />
                </button>
            ) : null}
        </span>
    );
};
