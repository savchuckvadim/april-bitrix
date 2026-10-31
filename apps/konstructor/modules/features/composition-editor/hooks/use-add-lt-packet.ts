'use client';

import { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/modules/app';
import { addLtOtherPacket, removeLtOtherPacket } from '@/modules/entities/composition';
import { rowSetActions, type KRow } from '@/modules/entities/row-set';

/**
 * «+ Пакет LT» с шага цен (замена легаси-выбора пакета в «Добавить товар»):
 * пакет без состава товаром быть не может, поэтому сразу открывается наполнение.
 * Закрыли, ничего не выбрав, — пустой пакет убираем, как в легаси несохранённый.
 */
export const useAddLtPacket = (row: KRow) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [packetId, setPacketId] = useState<string | null>(null);

    const write = (composition: NonNullable<KRow['composition']>) =>
        dispatch(rowSetActions.setRowComposition({ setId: row.setId, key: row.key, composition }));

    return {
        open,
        add: () => {
            if (!row.composition) return;
            const id = nanoid(8);
            write(addLtOtherPacket(row.composition, id));
            setPacketId(id);
            setOpen(true);
        },
        setOpen: (next: boolean) => {
            setOpen(next);
            if (next || !row.composition) return;
            const added = row.composition.ltOther.find(packet => packet.id === packetId);
            if (added && !added.services.length) write(removeLtOtherPacket(row.composition, added.id));
        },
    };
};
