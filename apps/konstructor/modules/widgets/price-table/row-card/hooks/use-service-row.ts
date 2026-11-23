'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { academyPackagesFor, selectCatalog } from '@/modules/entities/catalog';
import type { RootState } from '@/modules/app';
import {
    garantRows,
    leadGarantRow,
    paidLtOwner,
    paidLtPacket,
    planServiceFieldWrite,
    planStarRemoval,
    rowSetActions,
    setServiceValues,
    setTermMonths,
    type KRow,
    type RowCompositionWrite,
} from '@/modules/entities/row-set';
import {
    describeLtPackets,
    removeLtOtherPacket,
    renameLtOtherPacket,
} from '@/modules/entities/composition';

/**
 * Значение сервисной строки (консалтинг, академия, СТАР, платный LT) одно на
 * набор и равно значению в ОБЪЕДИНЁННОМ наполнении всех garant-строк, поэтому
 * карточка читает его оттуда. Смена сервиса ПРЯМО В КАРТОЧКЕ (легаси-селекты
 * «Консалтинг»/«Дополнительно»/«Академия») пишется планом из entities/row-set:
 * новое значение получает ведущая garant-строка, у остальных поле
 * сбрасывается; sync-listener пересоберёт строки сам. LT-пакет напрямую не
 * выбирается — он производен от веса сервисов (правится в наполнении). Пакет
 * LT-other (строка lt_other) переименовывается и удаляется в наполнении той
 * garant-строки, которой принадлежит (refs.packetId). Академия — только
 * пакеты под срок сделки набора.
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
    const values = set ? setServiceValues(set) : null;
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

    const writeCompositions = (plan: RowCompositionWrite[]) => {
        for (const write of plan) dispatch(rowSetActions.setRowComposition(write));
    };

    // пакет этой строки: состав и вес — из той же модели, что подбирает строку;
    // платный LT собирается из объединённого наполнения набора
    const ltOtherPacket =
        row.productType === 'lt_other' && packetOwner?.composition
            ? (describeLtPackets(packetOwner.composition, {
                  catalog,
                  complect: catalog.complects.byCode[packetOwner.composition.complectCode] ?? null,
                  serviceDepartment,
              }).find(item => item.id === row.refs.packetId) ?? null)
            : null;
    const paidPacket =
        row.productType === 'lt' && set ? paidLtPacket(set, { catalog, serviceDepartment }) : null;
    const ltPacket = ltOtherPacket ?? paidPacket;
    const owner = row.productType === 'lt_other' ? packetOwner : set && paidLtOwner(set);

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
        currentConsalting: values?.consalting ?? null,
        currentAcademy: values?.academy ?? null,
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
        setConsalting: (code: string | null) => {
            if (set) writeCompositions(planServiceFieldWrite(set, 'consalting', code));
        },
        setAcademy: (code: string | null) => {
            if (set) writeCompositions(planServiceFieldWrite(set, 'academy', code));
        },
        removeStar: () => {
            if (set) writeCompositions(planStarRemoval(set));
        },
    };
};
