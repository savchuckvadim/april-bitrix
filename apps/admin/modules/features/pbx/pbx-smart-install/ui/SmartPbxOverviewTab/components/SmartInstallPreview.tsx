'use client';

import type { PbxSmartDiffNode } from '../../../model/types';

interface SmartInstallPreviewProps {
    diffNode: PbxSmartDiffNode;
}

/**
 * Shows a summary of what WOULD be created when the smart is installed.
 * Rendered only when the smart is not yet present in the DB.
 */
export function SmartInstallPreview({ diffNode }: SmartInstallPreviewProps) {
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Будет установлено при инсталляции:</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
                {diffNode.categories.length > 0 && (
                    <span>Категорий: {diffNode.categories.length}</span>
                )}
                {diffNode.fields.length > 0 && (
                    <span>Полей: {diffNode.fields.length}</span>
                )}
            </div>
        </div>
    );
}
