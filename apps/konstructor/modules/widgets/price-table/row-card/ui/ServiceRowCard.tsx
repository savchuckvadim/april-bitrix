'use client';

import { Trash2 } from 'lucide-react';
import type { KRow } from '@/modules/entities/row-set';
import { getServiceRefsLabel } from '../../lib/row-display.util';
import { CommercialInputs } from '../../commercial-inputs';
import { RowName } from './RowName';
import { useRowCard } from '../hooks/use-row-card';
import { useServiceRow } from '../hooks/use-service-row';

const PRODUCT_TYPE_LABEL: Record<string, string> = {
    lt: 'Legal Tech',
    lt_other: 'LT доп.',
    consalting: 'Консалтинг',
    star: 'СТАР',
    academy: 'Академия',
};

interface ServiceRowCardProps {
    row: KRow;
    collapsed: boolean;
}

/**
 * Сервисная строка (выводится из наполнения garant-строк). Функциональный
 * паритет с легаси-карточкой: сменить консалтинг/академию или убрать СТАР
 * можно прямо здесь (правка composition ведущей строки — sync пересоберёт);
 * LT-пакет производен от веса, меняется в наполнении.
 */
export const ServiceRowCard = ({ row, collapsed }: ServiceRowCardProps) => {
    const card = useRowCard(row, collapsed);
    const service = useServiceRow(row);
    const selectsDisabled = !service.canChangeService || card.isBlurred;

    return (
        <div
            className={`rounded-md border bg-card p-3 transition-opacity ${
                card.isBlurred ? 'opacity-50' : ''
            }`}
        >
            <div className="flex items-center gap-2">
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {PRODUCT_TYPE_LABEL[row.productType] ?? row.productType}
                </span>
                <RowName
                    displayName={row.names.alternativeName ?? row.names.name}
                    isCustom={Boolean(row.names.alternativeName)}
                    canEdit={!card.isBlurred}
                    onRename={card.rename}
                />
                {row.isFree ? (
                    <span className="shrink-0 text-xs text-success">
                        бесплатно
                    </span>
                ) : null}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {getServiceRefsLabel(row, card.catalog)}
                </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {row.productType === 'consalting' ? (
                    <select
                        className="rounded border bg-background px-1.5 py-1 text-xs text-foreground"
                        value={service.currentConsalting ?? ''}
                        disabled={selectsDisabled}
                        onChange={event =>
                            service.setConsalting(event.target.value || null)
                        }
                    >
                        <option value="">Только Горячая линия</option>
                        {service.consaltingOptions.map(option => (
                            <option key={option.code} value={option.code}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                ) : null}

                {row.productType === 'academy' ? (
                    <select
                        className="rounded border bg-background px-1.5 py-1 text-xs text-foreground"
                        value={service.currentAcademy ?? ''}
                        disabled={selectsDisabled}
                        onChange={event =>
                            service.setAcademy(event.target.value || null)
                        }
                    >
                        <option value="">Без академии</option>
                        {service.academyOptions.map(pkg => (
                            <option key={pkg.code} value={pkg.code}>
                                {pkg.totalHours} ч /{' '}
                                {pkg.monthQuantity ?? 'до конца'} мес
                            </option>
                        ))}
                    </select>
                ) : null}

                {row.productType === 'lt' ? (
                    <span title="Состав пакета меняется в наполнении строки">
                        пакет по весу LT: {service.ltWeight}
                    </span>
                ) : null}

                {row.productType === 'star' && service.canChangeService ? (
                    <button
                        type="button"
                        onClick={service.removeStar}
                        disabled={card.isBlurred}
                        className="flex items-center gap-1 rounded border px-1.5 py-0.5 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-3 w-3" /> убрать СТАР
                    </button>
                ) : null}
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
