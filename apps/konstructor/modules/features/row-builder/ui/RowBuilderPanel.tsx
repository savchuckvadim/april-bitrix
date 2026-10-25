'use client';

import { Button } from '@workspace/ui/components/button';
import { ChipSelect } from '@workspace/april-ui/fields';
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
                <ChipSelect
                    ariaLabel="Комплект"
                    value={complectCode}
                    options={complects.map(complect => ({
                        code: complect.code,
                        name: complect.title,
                    }))}
                    onChange={setComplectCode}
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Кол-во доступов (ОД)
                <OdSelect
                    catalog={catalog}
                    supplies={availableSupplies}
                    value={supplyCode}
                    onChange={setSupplyCode}
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Тип договора
                <ChipSelect
                    ariaLabel="Тип договора"
                    value={contractCode}
                    options={availableContracts.map(contract => ({
                        code: contract.code,
                        name: contract.name,
                    }))}
                    onChange={setContractCode}
                />
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
