'use client';

import React from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import type { PbxFieldEditState } from '../model/pbx-fields-slice';

interface PbxFieldStatusBadgeProps {
    edit: PbxFieldEditState | undefined;
}

/**
 * Микро-бейдж состояния сейва рядом со значением поля: спиннер во время
 * записи в Bitrix, галочка успеха (гаснет сама), красная ошибка с текстом
 * в title (после показа значение автоматически откатывается).
 */
export const PbxFieldStatusBadge: React.FC<PbxFieldStatusBadgeProps> = ({
    edit,
}) => {
    if (!edit) return null;
    if (edit.status === 'saving') {
        return (
            <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
        );
    }
    if (edit.status === 'saved') {
        return <Check className="h-3 w-3 shrink-0 text-success" />;
    }
    return (
        <span
            title={edit.message ?? 'Не удалось сохранить'}
            className="inline-flex"
        >
            <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
        </span>
    );
};
