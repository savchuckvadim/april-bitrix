'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { academyPackagesFor, selectCatalog } from '@/modules/entities/catalog';
import type { RootState } from '@/modules/app';
import {
    garantRows,
    leadGarantRow,
    rowSetActions,
    setTermMonths,
    type KRow,
} from '@/modules/entities/row-set';
import {
    describeLtPackets,
    removeLtOtherPacket,
    renameLtOtherPacket,
} from '@/modules/entities/composition';

/**
 * Сервисная строка выводится из наполнения garant-строк, поэтому смена
 * сервиса ПРЯМО В КАРТОЧКЕ (легаси-селекты «Консалтинг»/«Дополнительно»/
 * «Академия») — это правка composition ведущей garant-строки сета;
 * sync-listener пересоберёт строки сам. LT-пакет напрямую не выбирается —
 * он производен от веса сервисов (правится в наполнении). Пакет LT-other
 * (строка lt_other) переименовывается и удаляется в наполнении той garant-
 * строки, которой принадлежит (refs.packetId). Академия — только пакеты под
 * срок сделки набора.
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
    const serviceDepartment = useAppSelector((state: RootState) =>
        Boolean(state.rowSet.context.serviceDepartment),
    );
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

    // пакет этой строки: состав и вес — из той же модели, что подбирает строку
    const packetId = row.productType === 'lt_other' ? row.refs.packetId : 'paid';
    const owner = row.productType === 'lt_other' ? packetOwner : lead;
    const ltPacket =
        row.productType === 'lt' || row.productType === 'lt_other'
            ? (owner?.composition &&
                  describeLtPackets(owner.composition, {
                      catalog,
                      complect: catalog.complects.byCode[owner.composition.complectCode] ?? null,
                      serviceDepartment,
                  }).find(item => item.id === packetId)) ||
              null
            : null;

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
        academyOptions: academyPackagesFor(catalog, set ? setTermMonths(set, catalog) : null),
        currentConsalting: lead?.composition?.consalting ?? null,
        currentAcademy: lead?.composition?.academy ?? null,
        ltPacket,
        /** Строка, в наполнении которой правится состав этого пакета */
        ltOwner: owner,
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
