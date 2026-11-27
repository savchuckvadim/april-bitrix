'use client';

import { OdSelect } from '@/modules/features/custom-od';
import { useMainSupplySelect } from '../hooks/use-main-supply-select';

/**
 * Количество одновременных доступов (ОД) главной строки: короткая подпись и
 * компактный селект в одну строку над итогом шага «Комплект», без отдельной
 * карточки. Ширина — по колонке, в которой стоит.
 */
export const MainSupplySelect = () => {
    const supply = useMainSupplySelect();
    if (!supply.hasMainRow) return null;

    return (
        <div className="flex items-center gap-3">
            <span className="shrink-0 text-sm text-muted-foreground">Кол-во ОД</span>
            <OdSelect
                variant="field"
                catalog={supply.catalog}
                supplies={supply.supplies}
                value={supply.supplyCode}
                onChange={supply.changeSupply}
            />
        </div>
    );
};
