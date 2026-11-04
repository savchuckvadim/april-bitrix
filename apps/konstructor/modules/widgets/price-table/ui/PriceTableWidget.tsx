'use client';

import type { ReactNode } from 'react';
import { BuildSummary } from '@/modules/features/build-summary';
import { AcademyPickerButton } from '@/modules/features/academy-picker';
import { AddLtPacketButton } from '@/modules/features/composition-editor';
import { RowBuilderPanel } from '@/modules/features/row-builder';
import { FlowSummary } from '@/modules/features/flow-summary';
import { Screen, ScreenSplit } from '@/modules/shared';
import { TableHeader, type TableHeaderSlots } from '../table-header';
import { SetBlock } from '../set-block';
import { usePriceTable } from '../hooks/use-price-table';
import { PriceTableSkeleton } from './PriceTableSkeleton';

export interface PriceTableWidgetProps {
    /** Сборку ещё готовят снаружи (вспоминание слепка сделки) */
    isPreparing?: boolean;
    /** Над шапкой: замечания к сборке */
    notice?: ReactNode;
    /** Между шапкой и наборами: варианты комплекта */
    beforeSets?: ReactNode;
    header?: TableHeaderSlots;
}

/**
 * Шаг «Цены» (легаси PRODUCTS): шапка (главная строка + регион), основной сет,
 * наборы «Для сравнения», мастер добавления, академия у каждого набора
 * (она зависит от количества, которое задают здесь); наполнение — у каждого товара своё,
 * окном из карточки. Справа — итог и переход дальше. Всё про сделку приходит
 * пропсами: см. widgets/deal-price-table.
 */
export const PriceTableWidget = ({
    isPreparing,
    notice,
    beforeSets,
    header,
}: PriceTableWidgetProps) => {
    const table = usePriceTable();

    if (!table.catalogReady || isPreparing) {
        return <PriceTableSkeleton />;
    }

    return (
        <Screen>
            <ScreenSplit
                mainWidth="content"
                aside={
                    <FlowSummary title="Итог">
                        <BuildSummary />
                    </FlowSummary>
                }
            >
                <div className="flex flex-col gap-3">
                    {notice}

                    <TableHeader {...header} />
                    {beforeSets}

                    <h2 className="mt-1 text-sm font-semibold uppercase text-muted-foreground">
                        Основные
                    </h2>
                    <SetBlock set={table.general} label="Основной блок" />
                    {table.mainRow ? (
                        <div className="flex flex-wrap gap-2">
                            <AddLtPacketButton row={table.mainRow} />
                            <AcademyPickerButton set={table.general} />
                        </div>
                    ) : null}
                    <RowBuilderPanel />

                    {table.alternative.length ? (
                        <>
                            <h2 className="mt-2 text-sm font-semibold uppercase text-muted-foreground">
                                Для сравнения
                            </h2>
                            {table.alternative.map((set, index) => (
                                <div key={set.id} className="flex flex-col gap-2">
                                    <SetBlock set={set} label={`Набор ${index + 1}`} removable />
                                    <div>
                                        <AcademyPickerButton set={set} />
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>
            </ScreenSplit>
        </Screen>
    );
};
