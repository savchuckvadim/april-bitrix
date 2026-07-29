'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import type { RootState } from '@/modules/app';
import {
    leadGarantRow,
    rowSetActions,
    type KRow,
} from '@/modules/entities/row-set';
import { ltPacketWeight } from '@/modules/entities/composition';

/**
 * Сервисная строка выводится из наполнения garant-строк, поэтому смена
 * сервиса ПРЯМО В КАРТОЧКЕ (легаси-селекты «Консалтинг»/«Дополнительно»/
 * «Академия») — это правка composition ведущей garant-строки сета;
 * sync-listener пересоберёт строки сам. LT-пакет напрямую не выбирается —
 * он производен от веса ltInPacket (правится в наполнении).
 */
export const useServiceRow = (row: KRow) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const lead = useAppSelector((state: RootState) => {
        const set =
            state.rowSet.general.id === row.setId
                ? state.rowSet.general
                : state.rowSet.alternative.find(item => item.id === row.setId);
        return set ? leadGarantRow(set) : null;
    });

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
        setConsalting: (code: string | null) =>
            patchLeadComposition({ consalting: code }),
        setAcademy: (code: string | null) =>
            patchLeadComposition({ academy: code }),
        removeStar: () => patchLeadComposition({ star: false }),
    };
};
