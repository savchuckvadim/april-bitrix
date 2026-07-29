'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    selectCatalog,
} from '@/modules/entities/catalog';
import {
    rowSetActions,
    selectEditingSetId,
    selectRowSetContext,
    selectSelectedRow,
    type CommercialEdit,
    type KRow,
} from '@/modules/entities/row-set';
import type { CommercialDisabled } from '../../commercial-inputs';
import {
    rebuildRowWithRefs,
    type RowRefsPatch,
} from '../../lib/change-row-refs.util';

/**
 * Логика карточки строки: правки коммерции, рефов (комплект/ОД/договор
 * per-row), rename, удаление, disabled-матрица (свёрнутый вид, редактирование
 * другого сета), выбор строки для редактора наполнения.
 */
export const useRowCard = (row: KRow, collapsed: boolean) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const editingSetId = useAppSelector(selectEditingSetId);
    const selectedRow = useAppSelector(selectSelectedRow);

    const contract = catalog.contracts.byCode[row.refs.contractCode] ?? null;
    const complect = row.refs.complectCode
        ? (catalog.complects.byCode[row.refs.complectCode] ?? null)
        : null;

    const isEditingThisSet = editingSetId === row.setId;
    const isBlurred = editingSetId !== null && !isEditingThisSet;
    // В свёрнутом виде построчные правки закрыты, пока сет не в режиме
    // редактирования (легаси: только Количество на total-строке)
    const rowsLocked = collapsed && !isEditingThisSet;
    const commercialDisabled: CommercialDisabled = {
        price: rowsLocked || isBlurred || Boolean(row.isFree),
        quantity: rowsLocked || isBlurred,
        discount: rowsLocked || isBlurred || Boolean(row.isFree),
        sum: rowsLocked || isBlurred || Boolean(row.isFree),
    };

    const commitCommercial = (edit: CommercialEdit) =>
        dispatch(
            rowSetActions.editRowCommercial({
                setId: row.setId,
                key: row.key,
                edit,
            }),
        );

    const toggleDiscountMode = () =>
        dispatch(
            rowSetActions.toggleDiscountMode({
                setId: row.setId,
                key: row.key,
            }),
        );

    const rename = (alternativeName: string | null) =>
        dispatch(
            rowSetActions.renameRow({
                setId: row.setId,
                key: row.key,
                alternativeName,
            }),
        );

    const remove = () =>
        dispatch(
            rowSetActions.removeRow({ setId: row.setId, key: row.key }),
        );

    const select = () =>
        dispatch(
            rowSetActions.selectRow(
                selectedRow?.key === row.key ? null : row.key,
            ),
        );

    /** Смена рефов garant-строки: пересборка через каталог + sync listener */
    const changeRefs = (next: RowRefsPatch) => {
        const rebuilt = rebuildRowWithRefs(catalog, context, row, next);
        if (!rebuilt) {
            console.warn('Нет цены для выбранной комбинации', next);
            return;
        }
        dispatch(rowSetActions.upsertRow(rebuilt));
    };

    const availableSupplies = complect
        ? filterSuppliesForComplect(catalog.supplies.items, complect.type)
        : [];
    const availableContracts = complect
        ? filterContractsForSupply(catalog, complect.type, row.refs.supplyCode)
        : [];

    return {
        catalog,
        contract,
        complect,
        isSelected: selectedRow?.key === row.key,
        isBlurred,
        canDelete: row.role !== 'main' && !rowsLocked && !isBlurred,
        canEditRefs:
            row.productType === 'garant' && !rowsLocked && !isBlurred,
        commercialDisabled,
        availableSupplies,
        availableContracts,
        allComplects: [
            ...catalog.complects.prof,
            ...catalog.complects.universal,
        ],
        commitCommercial,
        toggleDiscountMode,
        rename,
        remove,
        select,
        changeRefs,
    };
};
