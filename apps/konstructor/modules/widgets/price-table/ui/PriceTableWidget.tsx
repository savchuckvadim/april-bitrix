'use client';

import type { ReactNode } from 'react';
import { BuildSummary } from '@/modules/features/build-summary';
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
 * наборы «Для сравнения», мастер добавления; наполнение — у каждого товара своё,
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
                        <div>
                            <AddLtPacketButton row={table.mainRow} />
                        </div>
                    ) : null}
                    <RowBuilderPanel />

                    {table.alternative.length ? (
                        <>
                            <h2 className="mt-2 text-sm font-semibold uppercase text-muted-foreground">
                                Для сравнения
                            </h2>
                            {table.alternative.map((set, index) => (
                                <SetBlock
                                    key={set.id}
                                    set={set}
                                    label={`Набор ${index + 1}`}
                                    removable
                                />
                            ))}
                        </>
                    ) : null}
                </div>
            </ScreenSplit>
        </Screen>
    );
};
