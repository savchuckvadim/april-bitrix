'use client';

import { AlertTriangle } from 'lucide-react';
import { RowBuilderPanel } from '@/modules/features/row-builder';
import { CompositionEditorPanel } from '@/modules/features/composition-editor';
import { TableHeader } from '../table-header';
import { SetBlock } from '../set-block';
import { usePriceTable } from '../hooks/use-price-table';
import { PriceTableSkeleton } from './PriceTableSkeleton';

/**
 * Экран PRODUCTS: шапка (главная строка + регион + поставщик),
 * основной сет, наборы «Для сравнения», мастер добавления и редактор
 * наполнения выбранной строки. Восстановленный слепок показывает
 * сохранённые цены как есть (warnings — баннером).
 */
export const PriceTableWidget = () => {
    const table = usePriceTable();

    if (!table.catalogReady || table.isRestoring) {
        return <PriceTableSkeleton />;
    }

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-3 p-4">
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

            {table.hasSelectedComposition ? <CompositionEditorPanel /> : null}
        </div>
    );
};
