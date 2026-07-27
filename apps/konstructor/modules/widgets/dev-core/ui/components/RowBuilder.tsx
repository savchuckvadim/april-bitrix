'use client';

import type { useDevCore } from '../../hooks/use-dev-core';
import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';

/** Сборка строки: комплект × ОД × договор + кнопки добавления */
export const RowBuilder = ({
    builder,
}: {
    builder: ReturnType<typeof useDevCore>['builder'];
}) => {
    const catalog = useAppSelector(selectCatalog);
    const allComplects = [
        ...catalog.complects.prof,
        ...catalog.complects.universal,
    ];

    return (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
            <label className="flex flex-col gap-1 text-xs">
                Комплект
                <select
                    className="rounded border bg-background px-2 py-1 text-sm"
                    value={builder.complectCode}
                    onChange={event =>
                        builder.setComplectCode(event.target.value)
                    }
                >
                    {allComplects.map(complect => (
                        <option key={complect.code} value={complect.code}>
                            {complect.title} ({complect.type})
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
                ОД (поставка)
                <select
                    className="rounded border bg-background px-2 py-1 text-sm"
                    value={builder.supplyCode}
                    onChange={event => builder.setSupplyCode(event.target.value)}
                >
                    {builder.availableSupplies.map(supply => (
                        <option key={supply.code} value={supply.code}>
                            {supply.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
                Договор
                <select
                    className="rounded border bg-background px-2 py-1 text-sm"
                    value={builder.contractCode}
                    onChange={event =>
                        builder.setContractCode(event.target.value)
                    }
                >
                    {builder.availableContracts.map(contract => (
                        <option key={contract.code} value={contract.code}>
                            {contract.name} ({contract.code})
                        </option>
                    ))}
                </select>
            </label>
            <button
                type="button"
                className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={builder.buildMain}
            >
                Собрать главный
            </button>
            <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm"
                onClick={builder.addAdditional}
            >
                + доп. Гарант
            </button>
            <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm"
                onClick={builder.addComparison}
            >
                + сравнение
            </button>
        </div>
    );
};
