'use client';

import { AcademyPickerButton } from '@/modules/features/academy-picker';
import { AddLtPacketButton } from '@/modules/features/composition-editor';
import { leadGarantRow, type RowSet } from '@/modules/entities/row-set';

export interface ComparisonSetActionsProps {
    set: RowSet;
}

/**
 * Что добавляется в набор для сравнения: пакеты LT (в наполнение его Гаранта,
 * сколько угодно, у каждого свой состав) и академия.
 */
export const ComparisonSetActions = ({ set }: ComparisonSetActionsProps) => {
    const lead = leadGarantRow(set);

    return (
        <>
            {lead ? <AddLtPacketButton row={lead} /> : null}
            <AcademyPickerButton set={set} />
        </>
    );
};
