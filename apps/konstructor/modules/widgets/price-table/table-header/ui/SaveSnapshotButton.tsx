'use client';

import { Check, Save } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useSaveSnapshot } from '../hooks/use-save-snapshot';

/** «Сохранить предложение» — слепок v2 в bx_document_deals по сделке */
export const SaveSnapshotButton = () => {
    const { canSave, isSaving, isSaved, error, save } = useSaveSnapshot();

    if (!canSave) return null;

    return (
        <div className="flex flex-col items-end gap-1">
            <Button size="sm" onClick={save} disabled={isSaving}>
                {isSaved ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Save className="h-4 w-4" />
                )}
                {isSaving
                    ? 'Сохраняю…'
                    : isSaved
                      ? 'Сохранено'
                      : 'Сохранить предложение'}
            </Button>
            {error ? (
                <span className="text-xs text-destructive">{error}</span>
            ) : null}
        </div>
    );
};
