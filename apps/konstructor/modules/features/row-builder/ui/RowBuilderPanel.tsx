'use client';

import { Button } from '@workspace/ui/components/button';
import { OdSelect } from '@/modules/features/custom-od';
import { useRowBuilder } from '../hooks/use-row-builder';

/**
 * Панель добавления строк: селекты комплект × ОД × договор + действия
 * «Главный товар» / «Добавить Гарант» / «Для сравнения».
 */
export const RowBuilderPanel = () => {
    const {
        catalog,
        catalogReady,
        complects,
        complectCode,
        supplyCode,
        contractCode,
        setComplectCode,
        setSupplyCode,
        setContractCode,
        availableSupplies,
        availableContracts,
        hasMain,
        canAddComparison,
        buildMain,
        addAdditional,
        addComparison,
    } = useRowBuilder();

    if (!catalogReady) return null;

    return (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Комплект
                <select
                    className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                    value={complectCode}
                    onChange={event => setComplectCode(event.target.value)}
                >
                    {complects.map(complect => (
                        <option key={complect.code} value={complect.code}>
                            {complect.title}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Кол-во доступов (ОД)
                <OdSelect
                    catalog={catalog}
                    supplies={availableSupplies}
                    value={supplyCode}
                    className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                    onChange={setSupplyCode}
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Тип договора
                <select
                    className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                    value={contractCode}
                    onChange={event => setContractCode(event.target.value)}
                >
                    {availableContracts.map(contract => (
                        <option key={contract.code} value={contract.code}>
                            {contract.name}
                        </option>
                    ))}
                </select>
            </label>
            <div className="ml-auto flex gap-2">
                {!hasMain ? (
                    <Button size="sm" onClick={buildMain}>
                        Главный товар
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={addAdditional}>
                        Добавить Гарант +
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={addComparison}
                    disabled={!canAddComparison}
                >
                    Для сравнения +
                </Button>
            </div>
        </div>
    );
};
