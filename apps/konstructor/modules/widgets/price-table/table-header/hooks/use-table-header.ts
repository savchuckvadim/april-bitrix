'use client';

import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    selectCatalog,
} from '@/modules/entities/catalog';
import {
    explainRefsRebuildFailure,
    rebuildRowWithRefs,
    rowSetActions,
    selectMainRow,
    selectRowSetContext,
    type RowRefsPatch,
} from '@/modules/entities/row-set';

/**
 * Экранные контролы главной строки (легаси-шапка Total.jsx): кол-во
 * одновременных доступов (ОД) и тип договора. Комплект и регион выбраны на
 * шагах «Параметры» и «Комплект» — здесь только показываются.
 */
export const useTableHeader = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const mainRow = useAppSelector(selectMainRow);

    const mainComplect = mainRow?.refs.complectCode
        ? (catalog.complects.byCode[mainRow.refs.complectCode] ?? null)
        : null;

    const changeMainRefs = (next: RowRefsPatch) => {
        if (!mainRow) return;
        const rebuilt = rebuildRowWithRefs(catalog, context, mainRow, next);
        if (!rebuilt) {
            toast.error(explainRefsRebuildFailure(catalog, context, mainRow, next));
            return;
        }
        dispatch(rowSetActions.upsertRow(rebuilt));
    };

    return {
        catalog,
        context,
        mainRow,
        mainComplect,
        availableSupplies: mainComplect
            ? filterSuppliesForComplect(
                  catalog.supplies.items,
                  mainComplect.type,
              )
            : [],
        availableContracts:
            mainComplect && mainRow
                ? filterContractsForSupply(
                      catalog,
                      mainComplect.type,
                      mainRow.refs.supplyCode,
                  )
                : [],
        regionTitle:
            catalog.regions.items.find(region => region.code === context.regionCode)
                ?.title ?? null,
        changeMainRefs,
    };
};
