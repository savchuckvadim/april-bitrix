'use client';

import { Trash2 } from 'lucide-react';
import {
    getComplectAttr,
    getComplectIcon,
    getComplectStyleOverride,
} from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import { getRowDisplayName } from '../../lib/row-display.util';
import { CommercialInputs } from '../../commercial-inputs';
import { RowName } from './RowName';
import { RowRefsLine } from './RowRefsLine';
import { useRowCard } from '../hooks/use-row-card';

interface RowCardProps {
    row: KRow;
    collapsed: boolean;
}

/**
 * Карточка garant-строки: тема комплекта (data-complect), имя с inline-
 * rename, per-row селекты комплект/ОД/договор, коммерческие поля, удаление.
 * Клик по заголовку выбирает строку для редактора наполнения.
 */
export const RowCard = ({ row, collapsed }: RowCardProps) => {
    const card = useRowCard(row, collapsed);
    const Icon = getComplectIcon(row.refs.complectCode);

    return (
        <div
            data-complect={getComplectAttr(row.refs.complectCode)}
            style={getComplectStyleOverride(card.complect)}
            className={`rounded-md border border-l-4 border-l-[var(--complect-current)] bg-card p-3 transition-opacity ${
                card.isBlurred ? 'opacity-50' : ''
            } ${card.isSelected ? 'ring-2 ring-[var(--complect-current)]' : ''}`}
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={card.select}
                    aria-label="Наполнение строки"
                    className="shrink-0"
                >
                    <Icon className="h-4 w-4 text-complect-current" />
                </button>
                <RowName
                    displayName={getRowDisplayName(row, card.catalog)}
                    isCustom={Boolean(row.names.alternativeName)}
                    canEdit={!card.isBlurred}
                    onRename={card.rename}
                />
                {row.role !== 'comparison' ? (
                    <span className="ml-1 shrink-0 rounded bg-complect-current px-1.5 py-0.5 text-[10px] text-complect-current-foreground">
                        {row.role === 'main' ? 'главный' : 'доп.'}
                    </span>
                ) : null}
                {card.canDelete ? (
                    <button
                        type="button"
                        onClick={card.remove}
                        aria-label="Удалить строку"
                        className="ml-auto rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            <div className="mt-1">
                <RowRefsLine
                    row={row}
                    catalog={card.catalog}
                    allComplects={card.allComplects}
                    availableSupplies={card.availableSupplies}
                    availableContracts={card.availableContracts}
                    canEdit={card.canEditRefs}
                    onChange={card.changeRefs}
                />
            </div>

            <div className="mt-2">
                <CommercialInputs
                    price={row.price}
                    contract={card.contract}
                    disabled={card.commercialDisabled}
                    onCommit={card.commitCommercial}
                    onToggleDiscountMode={card.toggleDiscountMode}
                />
            </div>
        </div>
    );
};
