'use client';

import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useLtPacketDraft } from '../hooks/use-lt-packet-draft';
import { LtPacketDialog } from './LtPacketDialog';

export interface LtPacketAddDialogProps {
    /** Garant-строка, в наполнение которой ляжет пакет */
    row: KRow;
    /** id нового пакета */
    packetId: string;
    onClose: () => void;
}

/**
 * Новый пакет LT: собирается в черновике окна и попадает в сборку по
 * «Добавить пакет»; «Отмена» и закрытие окна ничего не оставляют.
 */
export const LtPacketAddDialog = ({ row, packetId, onClose }: LtPacketAddDialogProps) => {
    const draft = useLtPacketDraft(row, packetId, { create: true, onDone: onClose });

    return (
        <LtPacketDialog
            draft={draft}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button disabled={!draft.assembled} onClick={draft.confirm}>
                        Добавить пакет
                    </Button>
                </>
            }
        />
    );
};
