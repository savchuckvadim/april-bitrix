'use client';

import { OdSelect } from '@/modules/features/custom-od';
import { useTableHeader } from '../hooks/use-table-header';
import { CurrentComplectName } from './CurrentComplectName';
import { SaveSnapshotButton } from './SaveSnapshotButton';

/**
 * Шапка таблицы (легаси Total.jsx): имя текущего комплекта + селекты
 * главной строки (комплект / ОД / договор), регион и поставщик (налог).
 */
export const TableHeader = () => {
    const header = useTableHeader();

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
            <div className="mr-auto flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                    Текущий комплект
                </span>
                <CurrentComplectName complect={header.mainComplect} />
            </div>

            {header.mainRow ? (
                <>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Комплект
                        <select
                            className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                            value={header.mainRow.refs.complectCode ?? ''}
                            onChange={event =>
                                header.changeMainRefs({
                                    complectCode: event.target.value,
                                })
                            }
                        >
                            {header.allComplects.map(complect => (
                                <option
                                    key={complect.code}
                                    value={complect.code}
                                >
                                    {complect.title}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Кол-во доступов (ОД)
                        <OdSelect
                            catalog={header.catalog}
                            supplies={header.availableSupplies}
                            value={header.mainRow.refs.supplyCode}
                            className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                            onChange={supplyCode =>
                                header.changeMainRefs({ supplyCode })
                            }
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        Тип договора
                        <select
                            className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                            value={header.mainRow.refs.contractCode}
                            onChange={event =>
                                header.changeMainRefs({
                                    contractCode: event.target.value,
                                })
                            }
                        >
                            {header.availableContracts.map(contract => (
                                <option
                                    key={contract.code}
                                    value={contract.code}
                                >
                                    {contract.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </>
            ) : null}

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Регион
                <select
                    className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                    value={header.context.regionCode ?? ''}
                    onChange={event => header.setRegion(event.target.value)}
                >
                    {header.regions.map(region => (
                        <option key={region.code} value={region.code}>
                            {region.title}
                        </option>
                    ))}
                </select>
            </label>

            {header.providers.length ? (
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Поставщик
                    <select
                        className="rounded border bg-background px-2 py-1.5 text-sm text-foreground"
                        value={header.currentProvider?.id ?? ''}
                        onChange={event =>
                            header.setProvider(Number(event.target.value))
                        }
                    >
                        {header.providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider.title || provider.name}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            <SaveSnapshotButton />
        </div>
    );
};
