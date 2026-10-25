'use client';

import { ListChecks } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import type { KRow } from '@/modules/entities/row-set';
import { useRowCompositionDialog } from '../hooks/use-row-composition-dialog';
import { CompositionEditorDialog } from './CompositionEditorDialog';

export interface RowCompositionButtonProps {
    row: KRow;
}

/** Кнопка «Наполнение» в карточке товара: открывает его наполнение окном. */
export const RowCompositionButton = ({ row }: RowCompositionButtonProps) => {
    const dialog = useRowCompositionDialog();

    return (
        <>
            <IconAction
                icon={ListChecks}
                label="Наполнение"
                hint="Инфоблоки, ЭР и сервисы этого товара"
                onClick={dialog.openDialog}
                size="md"
            />
            {dialog.open ? (
                <CompositionEditorDialog
                    row={row}
                    open={dialog.open}
                    onOpenChange={dialog.setOpen}
                />
            ) : null}
        </>
    );
};
