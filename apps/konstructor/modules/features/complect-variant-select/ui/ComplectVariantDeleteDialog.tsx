'use client';

import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';

export interface ComplectVariantDeleteDialogProps {
    open: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Подтверждение удаления: вариант и его элемент в Битриксе уходят насовсем. */
export const ComplectVariantDeleteDialog = ({
    open,
    title,
    onConfirm,
    onCancel,
}: ComplectVariantDeleteDialogProps) => (
    <GlassDialog
        open={open}
        onOpenChange={next => (next ? undefined : onCancel())}
        size="xs"
        intensity="soft"
        cardClassName="gap-4"
    >
        <DialogHeader>
            <DialogTitle>Удалить вариант «{title}»?</DialogTitle>
            <DialogDescription>
                Вариант и его элемент в Битриксе будут удалены насовсем. Вернуть их не получится.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel}>
                Отмена
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
                Удалить
            </Button>
        </DialogFooter>
    </GlassDialog>
);
