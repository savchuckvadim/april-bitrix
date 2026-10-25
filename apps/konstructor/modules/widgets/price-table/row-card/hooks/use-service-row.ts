'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import type { RootState } from '@/modules/app';
import {
    garantRows,
    leadGarantRow,
    rowSetActions,
    type KRow,
} from '@/modules/entities/row-set';
import {
    ltOtherPacketWeight,
    ltPacketWeight,
    removeLtOtherPacket,
    renameLtOtherPacket,
} from '@/modules/entities/composition';

/**
 * Сервисная строка выводится из наполнения garant-строк, поэтому смена
 * сервиса ПРЯМО В КАРТОЧКЕ (легаси-селекты «Консалтинг»/«Дополнительно»/
 * «Академия») — это правка composition ведущей garant-строки сета;
 * sync-listener пересоберёт строки сам. LT-пакет напрямую не выбирается —
 * он производен от веса ltInPacket (правится в наполнении). Пакет LT-other
 * (строка lt_other) переименовывается и удаляется в наполнении той garant-
 * строки, которой принадлежит (refs.packetId).
 */
export const useServiceRow = (row: KRow) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const set = useAppSelector((state: RootState) =>
        state.rowSet.general.id === row.setId
            ? state.rowSet.general
            : (state.rowSet.alternative.find(item => item.id === row.setId) ?? null),
    );
    const lead = set ? leadGarantRow(set) : null;
    // garant-строка, в наполнении которой лежит пакет LT-other этой строки
    const packetOwner =
        (row.refs.packetId &&
            set &&
            garantRows(set).find(garant =>
                garant.composition?.ltOther.some(packet => packet.id === row.refs.packetId),
            )) ||
        null;
    const packet =
        packetOwner?.composition?.ltOther.find(item => item.id === row.refs.packetId) ?? null;

    const patchLeadComposition = (
        patch: Partial<NonNullable<KRow['composition']>>,
    ) => {
        if (!lead?.composition) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: lead.setId,
                key: lead.key,
                composition: { ...lead.composition, ...patch },
            }),
        );
    };

    const ltWeight = lead?.composition
        ? ltPacketWeight(lead.composition, catalog)
        : 0;

    const writeOwnerComposition = (
        next: NonNullable<KRow['composition']>,
    ) => {
        if (!packetOwner) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: packetOwner.setId,
                key: packetOwner.key,
                composition: next,
            }),
        );
    };

    return {
        catalog,
        canChangeService: Boolean(lead?.composition),
        consaltingOptions: catalog.services.consalting.filter(
            service => service.code !== 'hotline',
        ),
        academyOptions: catalog.academy,
        currentConsalting: lead?.composition?.consalting ?? null,
        currentAcademy: lead?.composition?.academy ?? null,
        ltWeight,
        ltOther: packet
            ? { weight: ltOtherPacketWeight(packet, catalog), servicesCount: packet.services.length }
            : null,
        renameLtOther: (name: string | null) =>
            packetOwner?.composition &&
            packet &&
            writeOwnerComposition(renameLtOtherPacket(packetOwner.composition, packet.id, name)),
        removeLtOther: () =>
            packetOwner?.composition &&
            packet &&
            writeOwnerComposition(removeLtOtherPacket(packetOwner.composition, packet.id)),
        setConsalting: (code: string | null) =>
            patchLeadComposition({ consalting: code }),
        setAcademy: (code: string | null) =>
            patchLeadComposition({ academy: code }),
        removeStar: () => patchLeadComposition({ star: false }),
    };
};
