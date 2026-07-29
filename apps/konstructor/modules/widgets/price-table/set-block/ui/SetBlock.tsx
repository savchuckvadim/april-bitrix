'use client';

import { Combine, Pencil, RefreshCw, Split, Trash2 } from 'lucide-react';
import {
    getComplectAttr,
    getComplectStyleOverride,
} from '@/modules/entities/catalog';
import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import { leadGarantRow, type RowSet } from '@/modules/entities/row-set';
import { RowCard, ServiceRowCard, TotalRowCard } from '../../row-card';
import { SetSummary } from './SetSummary';
import { useSetBlock } from '../hooks/use-set-block';

interface SetBlockProps {
    set: RowSet;
    label: string;
    removable?: boolean;
}

/**
 * Блок сета (general и comparison): сводка, «Объединить/Разъединить»,
 * карандаш редактирования свёрнутого сета, пересчёт по текущим ценам.
 * Свёрнут → TotalRowCard, развёрнут → карточки строк.
 */
export const SetBlock = ({ set, label, removable = false }: SetBlockProps) => {
    const catalog = useAppSelector(selectCatalog);
    const block = useSetBlock(set);
    const lead = leadGarantRow(set);
    const leadComplect = lead?.refs.complectCode
        ? (catalog.complects.byCode[lead.refs.complectCode] ?? null)
        : null;

    if (!set.rows.length) return null;

    return (
        <section
            data-complect={getComplectAttr(lead?.refs.complectCode)}
            style={getComplectStyleOverride(leadComplect)}
            className={`rounded-lg border border-t-4 border-t-[var(--complect-current)] bg-background p-3 transition-opacity ${
                block.isBlurred ? 'opacity-60' : ''
            }`}
        >
            <div className="mb-2 flex items-center gap-2">
                <SetSummary label={label} summary={block.summary} />
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={block.resync}
                        title="Пересчитать по текущим ценам"
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    {set.collapsed ? (
                        <button
                            type="button"
                            onClick={block.toggleEditing}
                            title="Редактировать строки объединённого сета"
                            className={`rounded p-1 hover:bg-muted ${
                                block.isEditing
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    ) : null}
                    {block.canMerge ? (
                        <button
                            type="button"
                            onClick={block.toggleCollapsed}
                            title={
                                set.collapsed ? 'Разъединить' : 'Объединить'
                            }
                            className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-foreground hover:bg-muted"
                        >
                            {set.collapsed ? (
                                <Split className="h-3.5 w-3.5" />
                            ) : (
                                <Combine className="h-3.5 w-3.5" />
                            )}
                            {set.collapsed ? 'Разъединить' : 'Объединить'}
                        </button>
                    ) : null}
                    {removable ? (
                        <button
                            type="button"
                            onClick={block.removeSet}
                            title="Удалить набор"
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {set.collapsed && !block.isEditing ? (
                block.total ? (
                    <TotalRowCard total={block.total} />
                ) : null
            ) : (
                <div className="flex flex-col gap-2">
                    {set.rows.map(row =>
                        row.productType === 'garant' ? (
                            <RowCard
                                key={row.key}
                                row={row}
                                collapsed={set.collapsed}
                            />
                        ) : (
                            <ServiceRowCard
                                key={row.key}
                                row={row}
                                collapsed={set.collapsed}
                            />
                        ),
                    )}
                    {set.collapsed && block.total ? (
                        <TotalRowCard total={block.total} />
                    ) : null}
                </div>
            )}
        </section>
    );
};
