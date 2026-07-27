'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';

interface PbxFieldConfirmDialogProps {
    open: boolean;
    fieldName: string;
    /** Человекочитаемые «было» → «станет». */
    fromLabel: string;
    toLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Подтверждение изменения важного pbx-поля (конфиг confirm=true — поля,
 * влияющие на финансовые расчёты/документы): «было → станет».
 */
export const PbxFieldConfirmDialog: React.FC<PbxFieldConfirmDialogProps> = ({
    open,
    fieldName,
    fromLabel,
    toLabel,
    onConfirm,
    onCancel,
}) => (
    <Dialog open={open} onOpenChange={value => !value && onCancel()}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>Изменить «{fieldName}»?</DialogTitle>
                <DialogDescription>
                    {fromLabel} → {toLabel}. Значение сохранится в Bitrix.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Отмена
                </Button>
                <Button size="sm" onClick={onConfirm}>
                    Изменить
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
