'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { academyFits, academyPackagesFor, selectCatalog } from '@/modules/entities/catalog';
import { leadGarantRow, rowSetActions, setTermMonths, type RowSet } from '@/modules/entities/row-set';
import { groupAcademyPackages } from '../lib/academy-groups.util';

/**
 * Академия набора (легаси AcademyInitButton + AcademyEditModal на экране
 * товаров): выбор живёт в наполнении ведущего Гаранта, срок сделки —
 * количество × договор этого набора, поэтому кнопка стоит там, где задают
 * количество. Пакет, переставший подходить, остаётся выбранным с
 * предупреждением: строка вернётся, когда срок совпадёт.
 */
export const useAcademyPicker = (set: RowSet) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const [open, setOpen] = useState(false);

    const lead = leadGarantRow(set);
    const termMonths = setTermMonths(set, catalog);
    const currentCode = lead?.composition?.academy ?? null;
    const current = catalog.academy.find(pkg => pkg.code === currentCode) ?? null;
    const currentFits = !current || termMonths === null || academyFits(current, termMonths);

    const choose = (code: string | null) => {
        if (!lead?.composition) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: set.id,
                key: lead.key,
                composition: { ...lead.composition, academy: code },
            }),
        );
        setOpen(false);
    };

    return {
        open,
        setOpen,
        canPick: Boolean(lead?.composition),
        termMonths,
        groups: groupAcademyPackages(academyPackagesFor(catalog, termMonths), termMonths),
        current,
        currentFits,
        choose,
    };
};

export type AcademyPickerState = ReturnType<typeof useAcademyPicker>;
