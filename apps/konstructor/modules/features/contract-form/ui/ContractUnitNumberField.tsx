'use client';

import type { ContractUnit } from '@/modules/entities/contract-document';
import { useContractUnit } from '../hooks/use-contract-unit';
import { ContractDealFieldInput } from './ContractDealFieldInput';

export interface ContractUnitNumberFieldProps {
    unit: ContractUnit;
}

/** Номер договора варианта: у каждого договора свой, в поля сделки не пишется. */
export const ContractUnitNumberField = ({ unit }: ContractUnitNumberFieldProps) => {
    const contract = useContractUnit(unit);

    return (
        <ContractDealFieldInput
            id={`contract-number-${unit.key}`}
            label="Номер договора"
            type="string"
            value={contract.contractNumber}
            onChange={contract.setContractNumber}
        />
    );
};
