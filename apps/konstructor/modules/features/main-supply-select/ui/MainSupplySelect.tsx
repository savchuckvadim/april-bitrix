'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { OdSelect } from '@/modules/features/custom-od';
import { useMainSupplySelect } from '../hooks/use-main-supply-select';

/**
 * Вид поставки главной строки (количество одновременных доступов, ОД) крупным
 * селектом над итогом шага «Комплект». Ширина — по колонке, в которой стоит.
 */
export const MainSupplySelect = () => {
    const supply = useMainSupplySelect();
    if (!supply.hasMainRow) return null;

    return (
        <SectionCard density="compact" title="Вид поставки (кол-во ОД)">
            <OdSelect
                variant="field"
                catalog={supply.catalog}
                supplies={supply.supplies}
                value={supply.supplyCode}
                onChange={supply.changeSupply}
            />
        </SectionCard>
    );
};
