'use client';

import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useAddLtPacket } from '../hooks/use-add-lt-packet';
import { LtPacketAddDialog } from './LtPacketAddDialog';

export interface AddLtPacketButtonProps {
    /** Гарант набора (главный или набора для сравнения): доп. пакеты живут в его наполнении */
    row: KRow;
}

/** Добавить пакет Legal Tech прямо с шага цен: окно только с этим пакетом. */
export const AddLtPacketButton = ({ row }: AddLtPacketButtonProps) => {
    const packet = useAddLtPacket();
    if (!row.composition) return null;

    return (
        <>
            <Button variant="outline" size="sm" onClick={packet.start}>
                <Plus aria-hidden />
                Пакет LT
            </Button>
            {packet.packetId ? (
                <LtPacketAddDialog row={row} packetId={packet.packetId} onClose={packet.close} />
            ) : null}
        </>
    );
};
