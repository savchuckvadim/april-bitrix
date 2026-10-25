'use client';

import { AlertTriangle } from 'lucide-react';
import { BuildSummary } from '@/modules/features/build-summary';
import { RowBuilderPanel } from '@/modules/features/row-builder';
import { ComplectVariantPanel } from '@/modules/features/complect-variant-select';
import { FlowSummary } from '@/modules/features/flow-summary';
import { Screen, ScreenSplit } from '@/modules/shared';
import { TableHeader } from '../table-header';
import { SetBlock } from '../set-block';
import { usePriceTable } from '../hooks/use-price-table';
import { PriceTableSkeleton } from './PriceTableSkeleton';

/**
 * Шаг «Цены» (легаси PRODUCTS): шапка (главная строка + регион + поставщик),
 * основной сет, наборы «Для сравнения», мастер добавления; наполнение —
 * у каждого товара своё, окном из карточки. Справа — итог и переход к документу.
 * Восстановленный слепок показывает сохранённые цены как есть (warnings —
 * баннером).
 */
export const PriceTableWidget = () => {
    const table = usePriceTable();

    if (!table.catalogReady || table.isRestoring) {
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
                    {table.snapshotWarnings.length ? (
                        <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-xs text-foreground">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                            <div>
                                <div className="mb-1 font-semibold">
                                    Сделка восстановлена с замечаниями:
                                </div>
                                {table.snapshotWarnings.map(warning => (
                                    <div key={warning}>{warning}</div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <TableHeader />
                    <ComplectVariantPanel />

                    <h2 className="mt-1 text-sm font-semibold uppercase text-muted-foreground">
                        Основные
                    </h2>
                    <SetBlock set={table.general} label="Основной блок" />
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
