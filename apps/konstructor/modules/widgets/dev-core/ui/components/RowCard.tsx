'use client';

import {
    getComplectAttr,
    getComplectIcon,
    getComplectStyleOverride,
    selectCatalog,
} from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import { useAppSelector } from '@/modules/app';

/** Карточка строки: окраска и иконка — от комплекта строки (data-complect) */
export const RowCard = ({
    row,
    isSelected,
    onSelect,
}: {
    row: KRow;
    isSelected: boolean;
    onSelect: (key: string) => void;
}) => {
    const catalog = useAppSelector(selectCatalog);
    const complect = row.refs.complectCode
        ? (catalog.complects.byCode[row.refs.complectCode] ?? null)
        : null;
    const Icon = getComplectIcon(row.refs.complectCode);

    return (
        <button
            type="button"
            data-complect={getComplectAttr(row.refs.complectCode)}
            style={getComplectStyleOverride(complect)}
            onClick={() => onSelect(row.key)}
            className={`w-full rounded-md border border-l-4 border-l-[var(--complect-current)] bg-card p-3 text-left transition-colors ${
                isSelected ? 'ring-2 ring-[var(--complect-current)]' : ''
            }`}
        >
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-complect-current" />
                <span className="truncate text-sm font-medium">
                    {row.names.name}
                </span>
                <span className="ml-auto rounded bg-complect-current px-1.5 py-0.5 text-xs text-complect-current-foreground">
                    {row.role}
                </span>
            </div>
            <div className="mt-1 flex items-baseline gap-3 text-xs text-muted-foreground">
                <span>{row.refs.supplyCode}</span>
                <span>{row.refs.contractCode}</span>
                {row.isFree ? <span className="text-success">бесплатно</span> : null}
                <span className="ml-auto text-sm font-semibold text-foreground">
                    {row.price.current.toLocaleString('ru-RU')} ₽
                </span>
            </div>
        </button>
    );
};
