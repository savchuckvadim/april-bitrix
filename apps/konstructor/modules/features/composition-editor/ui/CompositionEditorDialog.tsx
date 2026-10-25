'use client';

import { GlassDialog } from '@workspace/april-ui';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import type { KRow } from '@/modules/entities/row-set';
import { useCompositionEditor } from '../hooks/use-composition-editor';
import { CompositionEditorBody } from './CompositionEditorBody';
import { CompositionToolbar } from './CompositionToolbar';

export interface CompositionEditorDialogProps {
    row: KRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Наполнение одного товара окном (шаг «Цены»): у каждого Гаранта в сете своё
 * наполнение — правится из его карточки, не занимая экран таблицы.
 */
export const CompositionEditorDialog = ({
    row,
    open,
    onOpenChange,
}: CompositionEditorDialogProps) => {
    const editor = useCompositionEditor(row);

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="full"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader className="flex-row flex-wrap items-center justify-between gap-3 pr-8">
                <DialogTitle>Наполнение: {row.names.shortName}</DialogTitle>
                <CompositionToolbar editor={editor} />
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto pr-1">
                <CompositionEditorBody editor={editor} />
            </div>
        </GlassDialog>
    );
};
