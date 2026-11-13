'use client';

import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useAddLtPacket } from '../hooks/use-add-lt-packet';
import { LtPacketDialog } from './LtPacketDialog';

export interface AddLtPacketButtonProps {
    /** Главная строка: доп. пакеты живут в её наполнении */
    row: KRow;
}

/** Добавить пакет Legal Tech прямо с шага цен: окно только с этим пакетом. */
export const AddLtPacketButton = ({ row }: AddLtPacketButtonProps) => {
    const packet = useAddLtPacket(row);

    return (
        <>
            <Button variant="outline" size="sm" onClick={packet.add}>
                <Plus aria-hidden />
                Пакет LT
            </Button>
            {packet.packetId ? (
                <LtPacketDialog
                    row={row}
                    packetId={packet.packetId}
                    onClose={packet.confirm}
                    footer={
                        <>
                            <Button variant="outline" onClick={packet.cancel}>
                                Отменить
                            </Button>
                            <Button disabled={!packet.canConfirm} onClick={packet.confirm}>
                                Добавить пакет
                            </Button>
                        </>
                    }
                />
            ) : null}
        </>
    );
};
