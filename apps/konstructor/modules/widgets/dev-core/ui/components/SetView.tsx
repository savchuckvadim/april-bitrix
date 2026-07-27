'use client';

import type { KRow, RowSet } from '@/modules/entities/row-set';
import { buildTotalRow } from '@/modules/entities/row-set';
import { RowCard } from './RowCard';

/** Сет строк с total-подвалом */
export const SetView = ({
    title,
    set,
    selectedKey,
    onSelect,
}: {
    title: string;
    set: RowSet;
    selectedKey: string | null;
    onSelect: (key: string) => void;
}) => {
    const total: KRow | null = buildTotalRow(set);

    return (
        <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {title}
            </div>
            <div className="flex flex-col gap-2">
                {set.rows.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        Пусто — соберите строку
                    </div>
                ) : (
                    set.rows.map(row => (
                        <RowCard
                            key={row.key}
                            row={row}
                            isSelected={row.key === selectedKey}
                            onSelect={onSelect}
                        />
                    ))
                )}
            </div>
            {total && set.rows.length > 1 ? (
                <div className="mt-2 border-t pt-2 text-sm">
                    <span className="text-muted-foreground">Итого: </span>
                    <span className="font-semibold">
                        {total.price.current.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                        {total.names.shortName}
                    </span>
                </div>
            ) : null}
        </div>
    );
};
