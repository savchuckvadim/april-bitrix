'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import {
    rowSetActions,
    selectEditingSetId,
    type CommercialEdit,
    type KRow,
} from '@/modules/entities/row-set';
import { CommercialInputs } from '../../commercial-inputs';

interface TotalRowCardProps {
    total: KRow;
}

/**
 * Свёрнутая total-строка сета: имена через « + », суммарные цены.
 * По умолчанию редактируется только Количество; полный доступ — в режиме
 * редактирования сета (легаси SET-режим). Правки → editTotalCommercial.
 */
export const TotalRowCard = ({ total }: TotalRowCardProps) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const editingSetId = useAppSelector(selectEditingSetId);

    const isEditing = editingSetId === total.setId;
    const isBlurred = editingSetId !== null && !isEditing;
    const contract = catalog.contracts.byCode[total.refs.contractCode] ?? null;

    const commit = (edit: CommercialEdit) =>
        dispatch(
            rowSetActions.editTotalCommercial({ setId: total.setId, edit }),
        );

    return (
        <div
            className={`rounded-md border-2 border-dashed bg-card p-3 transition-opacity ${
                isBlurred ? 'opacity-50' : ''
            }`}
        >
            <div
                className="truncate text-sm font-semibold"
                title={total.names.name}
            >
                {total.names.name}
            </div>
            <div className="mt-2">
                <CommercialInputs
                    price={total.price}
                    contract={contract}
                    disabled={{
                        price: !isEditing || isBlurred,
                        quantity: isBlurred,
                        discount: !isEditing || isBlurred,
                        sum: !isEditing || isBlurred,
                    }}
                    onCommit={commit}
                    onToggleDiscountMode={() => undefined}
                />
            </div>
        </div>
    );
};
