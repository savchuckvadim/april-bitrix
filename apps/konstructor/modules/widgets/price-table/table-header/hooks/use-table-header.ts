'use client';

import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    selectCatalog,
} from '@/modules/entities/catalog';
import { setCurrentProvider } from '@/modules/entities/provider';
import type { RootState } from '@/modules/app';
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
 * плюс регион (пересчёт всех сетов) и поставщик (налог, через listener).
 */
export const useTableHeader = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const mainRow = useAppSelector(selectMainRow);
    const providers = useAppSelector(
        (state: RootState) => state.documentProvider.items,
    );
    const currentProvider = useAppSelector(
        (state: RootState) => state.documentProvider.current,
    );

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

    const setProvider = (id: string) => dispatch(setCurrentProvider(id));

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
        regions: catalog.regions.items,
        providers,
        currentProvider,
        changeMainRefs,
        setRegion,
        setProvider,
    };
};
