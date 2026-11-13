'use client';

import { ListChecks } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import type { KRow } from '@/modules/entities/row-set';
import { useRowCompositionDialog } from '../hooks/use-row-composition-dialog';
import { LtPacketEditDialog } from './LtPacketEditDialog';

export interface LtPacketEditButtonProps {
    /** Garant-строка, в наполнении которой лежит пакет */
    row: KRow;
    packetId: string;
}

/** Кнопка «Состав пакета» у строки доп. пакета LT: окно только с этим пакетом. */
export const LtPacketEditButton = ({ row, packetId }: LtPacketEditButtonProps) => {
    const dialog = useRowCompositionDialog();

    return (
        <>
            <IconAction
                icon={ListChecks}
                label="Состав пакета"
                hint="Сервисы этого пакета Legal Tech"
                onClick={dialog.openDialog}
                size="md"
            />
            {dialog.open ? (
                <LtPacketEditDialog
                    row={row}
                    packetId={packetId}
                    onClose={() => dialog.setOpen(false)}
                />
            ) : null}
        </>
    );
};
