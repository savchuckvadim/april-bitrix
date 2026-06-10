'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';

interface MappingDialogShellProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    canConfirm: boolean;
    isPending?: boolean;
    onConfirm: () => void;
    children: React.ReactNode;
}

/**
 * Shared dialog shell for all mapping dialogs.
 * Provides consistent header / footer layout.
 */
export function MappingDialogShell({
    open,
    onOpenChange,
    title,
    canConfirm,
    isPending = false,
    onConfirm,
    children,
}: MappingDialogShellProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {children}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        disabled={!canConfirm || isPending}
                        onClick={onConfirm}
                    >
                        Сопоставить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
