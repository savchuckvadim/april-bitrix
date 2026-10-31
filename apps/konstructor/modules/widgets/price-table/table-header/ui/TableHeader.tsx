'use client';

import type { ReactNode } from 'react';
import { ChipSelect } from '@workspace/april-ui/fields';
import { OdSelect } from '@/modules/features/custom-od';
import { useTableHeader } from '../hooks/use-table-header';
import { CurrentComplectName } from './CurrentComplectName';

export interface TableHeaderSlots {
    /** Рядом с именем комплекта: период сервисного отдела */
    lead?: ReactNode;
    /** Поля после региона: поставщик */
    fields?: ReactNode;
    /** Кнопки в конце строки: сохранение и отправка */
    actions?: ReactNode;
}

/**
 * Шапка таблицы (легаси Total.jsx): имя текущего комплекта + селекты
 * главной строки (комплект / ОД / договор) и регион. То, что связано со сделкой,
 * приходит слотами: публичная версия о сделке не знает.
 * Селекты — чипы дизайн-системы: значения меняют редко.
 */
export const TableHeader = ({ lead, fields, actions }: TableHeaderSlots) => {
    const header = useTableHeader();

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
            <div className="mr-auto flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                    Текущий комплект
                </span>
                <CurrentComplectName complect={header.mainComplect} />
            </div>
            {lead}

            {header.mainRow ? (
                <>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Комплект
                        <ChipSelect
                            ariaLabel="Комплект"
                            value={header.mainRow.refs.complectCode ?? ''}
                            options={header.allComplects.map(complect => ({
                                code: complect.code,
                                name: complect.title,
                            }))}
                            onChange={complectCode =>
                                header.changeMainRefs({ complectCode })
                            }
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Кол-во доступов (ОД)
                        <OdSelect
                            catalog={header.catalog}
                            supplies={header.availableSupplies}
                            value={header.mainRow.refs.supplyCode}
                            onChange={supplyCode =>
                                header.changeMainRefs({ supplyCode })
                            }
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Тип договора
                        <ChipSelect
                            ariaLabel="Тип договора"
                            value={header.mainRow.refs.contractCode}
                            options={header.availableContracts.map(contract => ({
                                code: contract.code,
                                name: contract.name,
                            }))}
                            onChange={contractCode =>
                                header.changeMainRefs({ contractCode })
                            }
                        />
                    </label>
                </>
            ) : null}

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Регион
                <ChipSelect
                    ariaLabel="Регион"
                    value={header.context.regionCode ?? ''}
                    options={header.regions.map(region => ({
                        code: region.code,
                        name: region.title,
                    }))}
                    onChange={header.setRegion}
                />
            </label>

            {fields}
            {actions}
        </div>
    );
};
