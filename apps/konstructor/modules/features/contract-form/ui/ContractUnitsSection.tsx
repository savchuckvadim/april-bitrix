'use client';

import { useContractUnits } from '../hooks/use-contract-units';
import { ContractUnitCard } from './ContractUnitCard';
import { ContractUnitsToolbar } from './ContractUnitsToolbar';

/** Договоры по вариантам комплекта: панель «Сформировать все» и по карточке на каждый вариант. */
export const ContractUnitsSection = () => {
    const contracts = useContractUnits();

    return (
        <>
            <ContractUnitsToolbar />
            {contracts.units.map(unit => (
                <ContractUnitCard key={unit.key} unit={unit} />
            ))}
        </>
    );
};
