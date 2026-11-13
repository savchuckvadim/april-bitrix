'use client';

import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useLtPacketDraft } from '../hooks/use-lt-packet-draft';
import { LtPacketDialog } from './LtPacketDialog';

export interface LtPacketEditDialogProps {
    /** Garant-строка, в наполнении которой лежит пакет */
    row: KRow;
    packetId: string;
    onClose: () => void;
}

/**
 * Правка уже добавленного пакета LT: сервисы меняются в черновике, строка
 * пакета в таблице не трогается до «Сохранить» — можно снять один сервис и
 * отметить другой, даже если вес на время упал до нуля.
 */
export const LtPacketEditDialog = ({ row, packetId, onClose }: LtPacketEditDialogProps) => {
    const draft = useLtPacketDraft(row, packetId, { onDone: onClose });

    return (
        <LtPacketDialog
            draft={draft}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button disabled={!draft.changed || !draft.assembled} onClick={draft.confirm}>
                        Сохранить
                    </Button>
                </>
            }
        />
    );
};
