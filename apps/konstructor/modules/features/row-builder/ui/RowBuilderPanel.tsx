'use client';

import { Button } from '@workspace/ui/components/button';
import { ChipSelect } from '@workspace/april-ui/fields';
import { OdSelect } from '@/modules/features/custom-od';
import { useRowBuilder } from '../hooks/use-row-builder';
import type { RowBuilderTarget } from '../model/types';

export interface RowBuilderPanelProps {
    /** Раздел, из заголовка которого открыт мастер */
    target: RowBuilderTarget;
    /** Добавили или передумали — мастер закрывается */
    onDone: () => void;
}

/**
 * Мастер добавления Гаранта под заголовком своего раздела: комплект × ОД ×
 * договор и одна кнопка — «Добавить к основным» или «Добавить набор».
 */
export const RowBuilderPanel = ({ target, onDone }: RowBuilderPanelProps) => {
    const builder = useRowBuilder(target, onDone);

    if (!builder.catalogReady) return null;

    return (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Комплект
                <ChipSelect
                    ariaLabel="Комплект"
                    value={builder.complectCode}
                    options={builder.complects.map(complect => ({
                        code: complect.code,
                        name: complect.title,
                    }))}
                    onChange={builder.setComplectCode}
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Кол-во доступов (ОД)
                <OdSelect
                    catalog={builder.catalog}
                    supplies={builder.availableSupplies}
                    value={builder.supplyCode}
                    onChange={builder.setSupplyCode}
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Тип договора
                <ChipSelect
                    ariaLabel="Тип договора"
                    value={builder.contractCode}
                    options={builder.availableContracts.map(contract => ({
                        code: contract.code,
                        name: contract.name,
                    }))}
                    onChange={builder.setContractCode}
                />
            </label>
            <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={onDone}>
                    Отмена
                </Button>
                <Button size="sm" disabled={!builder.canSubmit} onClick={builder.submit}>
                    {builder.submitLabel}
                </Button>
            </div>
        </div>
    );
};
