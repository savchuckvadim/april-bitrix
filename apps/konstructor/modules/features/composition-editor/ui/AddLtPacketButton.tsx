'use client';

import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { KRow } from '@/modules/entities/row-set';
import { useAddLtPacket } from '../hooks/use-add-lt-packet';
import { CompositionEditorDialog } from './CompositionEditorDialog';

export interface AddLtPacketButtonProps {
    /** Главная строка: доп. пакеты живут в её наполнении */
    row: KRow;
}

/** Добавить пакет Legal Tech прямо с шага цен: окно наполнения открывается сразу. */
export const AddLtPacketButton = ({ row }: AddLtPacketButtonProps) => {
    const packet = useAddLtPacket(row);

    return (
        <>
            <Button variant="outline" size="sm" onClick={packet.add}>
                <Plus aria-hidden />
                Пакет LT
            </Button>
            {packet.open ? (
                <CompositionEditorDialog row={row} open={packet.open} onOpenChange={packet.setOpen} />
            ) : null}
        </>
    );
};
