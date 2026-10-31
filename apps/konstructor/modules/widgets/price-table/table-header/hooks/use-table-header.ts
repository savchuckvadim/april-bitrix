'use client';

import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    selectableRegions,
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
 * Экранные контролы главной строки (легаси-шапка Total.jsx): комплект,
 * кол-во одновременных доступов (ОД), тип договора — это правки main-строки;
 * плюс регион (пересчёт всех сетов).
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

    const setRegion = (regionCode: string) =>
        dispatch(rowSetActions.setContext({ regionCode }));

    return {
        catalog,
        context,
        mainRow,
        mainComplect,
        allComplects: [
            ...catalog.complects.prof,
            ...catalog.complects.universal,
        ],
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
        // полный список — на шаге «Параметры»; здесь портальные и текущий
        regions: selectableRegions(catalog.regions.items, {
            showAll: false,
            currentCode: context.regionCode,
        }),
        changeMainRefs,
        setRegion,
    };
};
