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
import { BuilderToggleButton } from './BuilderToggleButton';
import { ComparisonSetActions } from './ComparisonSetActions';
import { PriceSectionHeading } from './PriceSectionHeading';
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
 * Шаг «Цены» (легаси PRODUCTS): шапка (главная строка + регион), раздел
 * «Основные» и раздел «Для сравнения». Всё, что добавляется в раздел, — на
 * линии его заголовка: Гарант, пакет LT и академия у «Основных», новый набор
 * у «Для сравнения»; мастер выбора комплекта открывается под тем же
 * заголовком. Пакеты LT и академия набора для сравнения — в строке заголовка
 * самого набора. Справа —
 * итог и переход дальше. Всё про сделку приходит пропсами: см. widgets/deal-price-table.
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

                    <PriceSectionHeading
                        title="Основные"
                        actions={
                            <>
                                <BuilderToggleButton
                                    label="Гарант"
                                    hint="Добавить Гарант в основной блок"
                                    active={table.builderTarget === 'general'}
                                    onClick={() => table.toggleBuilder('general')}
                                />
                                {table.mainRow ? <AddLtPacketButton row={table.mainRow} /> : null}
                                {table.mainRow ? <AcademyPickerButton set={table.general} /> : null}
                            </>
                        }
                    />
                    {table.builderTarget === 'general' ? (
                        <RowBuilderPanel target="general" onDone={table.closeBuilder} />
                    ) : null}
                    <SetBlock set={table.general} label="Основной блок" />

                    <PriceSectionHeading
                        title="Для сравнения"
                        actions={
                            <BuilderToggleButton
                                label="Набор"
                                hint={
                                    table.canAddComparison
                                        ? 'Новый набор для сравнения'
                                        : 'Наборов для сравнения уже максимум'
                                }
                                active={table.builderTarget === 'comparison'}
                                disabled={!table.canAddComparison}
                                onClick={() => table.toggleBuilder('comparison')}
                            />
                        }
                    />
                    {table.builderTarget === 'comparison' ? (
                        <RowBuilderPanel target="comparison" onDone={table.closeBuilder} />
                    ) : null}
                    {table.alternative.length ? (
                        table.alternative.map((set, index) => (
                            <SetBlock
                                key={set.id}
                                set={set}
                                label={`Набор ${index + 1}`}
                                removable
                                actions={<ComparisonSetActions set={set} />}
                            />
                        ))
                    ) : table.builderTarget === 'comparison' ? null : (
                        <p className="text-sm text-muted-foreground">
                            Наборов для сравнения пока нет.
                        </p>
                    )}
                </div>
            </ScreenSplit>
        </Screen>
    );
};
