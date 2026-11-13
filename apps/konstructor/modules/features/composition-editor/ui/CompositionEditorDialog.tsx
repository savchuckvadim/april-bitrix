'use client';

import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import type { KRow } from '@/modules/entities/row-set';
import { useRowCompositionDraft } from '../hooks/use-row-composition-draft';
import { CompositionEditorBody } from './CompositionEditorBody';
import { CompositionToolbar } from './CompositionToolbar';

export interface CompositionEditorDialogProps {
    row: KRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Наполнение одного товара окном (шаг «Цены»): у каждого Гаранта в сете своё
 * наполнение — правится из его карточки, не занимая экран таблицы. Правки
 * живут в окне до «Сохранить»; «Отмена» и закрытие окна их отбрасывают.
 */
export const CompositionEditorDialog = ({
    row,
    open,
    onOpenChange,
}: CompositionEditorDialogProps) => {
    const draft = useRowCompositionDraft(row, () => onOpenChange(false));

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
                <CompositionToolbar editor={draft.editor} />
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto pr-1">
                {/* доп. пакеты LT на «Ценах» правятся своими окнами (+ Пакет LT, строка пакета) */}
                <CompositionEditorBody editor={draft.editor} showExtraLt={false} />
            </div>
            <DialogFooter className="gap-2 border-t pt-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Отмена
                </Button>
                <Button disabled={!draft.changed} onClick={draft.confirm}>
                    Сохранить
                </Button>
            </DialogFooter>
        </GlassDialog>
    );
};
