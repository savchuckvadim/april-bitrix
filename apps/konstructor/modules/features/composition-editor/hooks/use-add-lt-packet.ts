'use client';

import { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/modules/app';
import { addLtOtherPacket, removeLtOtherPacket } from '@/modules/entities/composition';
import { rowSetActions, type KRow } from '@/modules/entities/row-set';

/**
 * «+ Пакет LT» с шага цен (замена легаси-выбора пакета в «Добавить товар»):
 * пакет без состава товаром быть не может, поэтому сразу открывается окно с
 * ЭТИМ пакетом. «Отменить» убирает его; закрыли, ничего не выбрав, —
 * пустой пакет тоже убираем, как в легаси несохранённый.
 */
export const useAddLtPacket = (row: KRow) => {
    const dispatch = useAppDispatch();
    const [packetId, setPacketId] = useState<string | null>(null);

    const write = (composition: NonNullable<KRow['composition']>) =>
        dispatch(rowSetActions.setRowComposition({ setId: row.setId, key: row.key, composition }));

    const added = row.composition?.ltOther.find(packet => packet.id === packetId) ?? null;

    const close = (keep: boolean) => {
        if (row.composition && added && (!keep || !added.services.length)) {
            write(removeLtOtherPacket(row.composition, added.id));
        }
        setPacketId(null);
    };

    return {
        open: packetId !== null,
        packetId,
        /** В пакете есть хоть один сервис — его можно добавить */
        canConfirm: Boolean(added?.services.length),
        add: () => {
            if (!row.composition) return;
            const id = nanoid(8);
            write(addLtOtherPacket(row.composition, id));
            setPacketId(id);
        },
        confirm: () => close(true),
        cancel: () => close(false),
    };
};
