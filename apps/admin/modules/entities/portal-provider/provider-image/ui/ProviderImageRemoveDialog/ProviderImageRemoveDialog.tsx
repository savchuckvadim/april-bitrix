'use client';

import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { PROVIDER_IMAGE_REMOVE_TEXT } from '../../model';

interface ProviderImageRemoveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Подпись роли для заголовка: «Печать», «Логотип» */
    roleLabel: string;
    isRemoving: boolean;
    onConfirm: () => void;
}

/** Подтверждение удаления картинки. Пока идёт удаление, окно не закрывается. */
export function ProviderImageRemoveDialog({
    open,
    onOpenChange,
    roleLabel,
    isRemoving,
    onConfirm,
}: ProviderImageRemoveDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !isRemoving && onOpenChange(next)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{PROVIDER_IMAGE_REMOVE_TEXT.title(roleLabel)}</DialogTitle>
                    <DialogDescription>{PROVIDER_IMAGE_REMOVE_TEXT.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isRemoving}
                        onClick={() => onOpenChange(false)}
                    >
                        {PROVIDER_IMAGE_REMOVE_TEXT.cancel}
                    </Button>
                    <Button variant="destructive" disabled={isRemoving} onClick={onConfirm}>
                        {isRemoving
                            ? PROVIDER_IMAGE_REMOVE_TEXT.removing
                            : PROVIDER_IMAGE_REMOVE_TEXT.confirm}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
