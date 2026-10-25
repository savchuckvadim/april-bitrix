'use client';

import { ChipSelect } from '@workspace/april-ui/fields';
import { OdSelect } from '@/modules/features/custom-od';
import { SaveToLibraryButton } from '@/modules/features/save-to-library';
import { DealSendButton } from '@/modules/features/deal-send';
import { ServicePeriodSwitch } from '@/modules/features/service-period';
import { useTableHeader } from '../hooks/use-table-header';
import { CurrentComplectName } from './CurrentComplectName';
import { SaveSnapshotButton } from './SaveSnapshotButton';

/**
 * Шапка таблицы (легаси Total.jsx): имя текущего комплекта + селекты
 * главной строки (комплект / ОД / договор), регион и поставщик (налог).
 * Селекты — чипы дизайн-системы: значения меняют редко.
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
            <ServicePeriodSwitch />

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

            {header.providers.length ? (
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Поставщик
                    <ChipSelect
                        ariaLabel="Поставщик"
                        value={header.currentProvider?.id ?? ''}
                        options={header.providers.map(provider => ({
                            code: provider.id,
                            name: provider.name,
                        }))}
                        onChange={header.setProvider}
                    />
                </label>
            ) : null}

            <SaveToLibraryButton />
            <SaveSnapshotButton />
            <DealSendButton navigateAfter />
        </div>
    );
};
