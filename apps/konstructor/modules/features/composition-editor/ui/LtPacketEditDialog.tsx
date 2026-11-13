'use client';

import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useCompositionRevert } from '../hooks/use-composition-revert';
import { LtPacketDialog } from './LtPacketDialog';

export interface LtPacketEditDialogProps {
    /** Garant-строка, в наполнении которой лежит пакет */
    row: KRow;
    packetId: string;
    onClose: () => void;
}

/**
 * Правка уже добавленного пакета LT: правки видны сразу, «Отменить
 * изменения» возвращает состав пакета на момент открытия окна.
 */
export const LtPacketEditDialog = ({ row, packetId, onClose }: LtPacketEditDialogProps) => {
    const revert = useCompositionRevert(row);

    return (
        <LtPacketDialog
            row={row}
            packetId={packetId}
            onClose={onClose}
            footer={
                <>
                    <Button
                        variant="outline"
                        disabled={!revert.changed}
                        onClick={() => {
                            revert.revert();
                            onClose();
                        }}
                    >
                        Отменить изменения
                    </Button>
                    <Button onClick={onClose}>Готово</Button>
                </>
            }
        />
    );
};
