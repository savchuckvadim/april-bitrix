'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { academyFits, academyPackagesFor, selectCatalog } from '@/modules/entities/catalog';
import {
    leadGarantRow,
    planServiceFieldWrite,
    rowSetActions,
    setServiceValues,
    setTermMonths,
    type RowSet,
} from '@/modules/entities/row-set';
import { groupAcademyPackages } from '../lib/academy-groups.util';

/**
 * Академия набора (легаси AcademyInitButton + AcademyEditModal на экране
 * товаров): текущий пакет читается из объединённого наполнения всех Гарантов
 * набора, выбор пишется в ведущий Гарант, а у остальных поле сбрасывается.
 * Срок сделки — количество × договор этого набора, поэтому кнопка стоит там,
 * где задают количество. Пакет, переставший подходить, остаётся выбранным с
 * предупреждением: строка вернётся, когда срок совпадёт.
 */
export const useAcademyPicker = (set: RowSet) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const [open, setOpen] = useState(false);

    const lead = leadGarantRow(set);
    const termMonths = setTermMonths(set, catalog);
    const currentCode = setServiceValues(set).academy;
    const current = catalog.academy.find(pkg => pkg.code === currentCode) ?? null;
    const currentFits = !current || termMonths === null || academyFits(current, termMonths);

    const choose = (code: string | null) => {
        for (const write of planServiceFieldWrite(set, 'academy', code)) {
            dispatch(rowSetActions.setRowComposition(write));
        }
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
