'use client';

import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterSuppliesForCurrentKind,
    selectCatalog,
} from '@/modules/entities/catalog';
import {
    explainRefsRebuildFailure,
    rebuildRowWithRefs,
    rowSetActions,
    selectMainRow,
    selectRowSetContext,
} from '@/modules/entities/row-set';

/**
 * Вид поставки (ОД) главной строки. Правила те же, что у шапки цен: допустимые
 * поставки — по линейке комплекта и виду доступа, выбранному на старте (другого
 * вида в списке нет), смена идёт через rebuildRowWithRefs
 * (матрица совместимости комплект × поставка × договор, цена из каталога).
 * Договор на этом шаге не виден, поэтому его автоматическую замену под новую
 * поставку озвучиваем сообщением.
 */
export const useMainSupplySelect = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const mainRow = useAppSelector(selectMainRow);

    const complect = mainRow?.refs.complectCode
        ? (catalog.complects.byCode[mainRow.refs.complectCode] ?? null)
        : null;

    const changeSupply = (supplyCode: string) => {
        if (!mainRow) return;
        const next = { supplyCode };
        const rebuilt = rebuildRowWithRefs(catalog, context, mainRow, next);
        if (!rebuilt) {
            toast.error(explainRefsRebuildFailure(catalog, context, mainRow, next));
            return;
        }
        dispatch(rowSetActions.upsertRow(rebuilt));

        if (rebuilt.refs.contractCode !== mainRow.refs.contractCode) {
            const contract = catalog.contracts.byCode[rebuilt.refs.contractCode];
            toast.info(
                `Тип договора изменён на «${contract?.name ?? rebuilt.refs.contractCode}»: прежний не подходит к этой поставке`,
            );
        }
    };

    return {
        hasMainRow: Boolean(mainRow),
        catalog,
        supplies:
            complect && mainRow
                ? filterSuppliesForCurrentKind(
                      catalog,
                      complect.type,
                      mainRow.refs.supplyCode,
                  )
                : [],
        supplyCode: mainRow?.refs.supplyCode ?? '',
        changeSupply,
    };
};
