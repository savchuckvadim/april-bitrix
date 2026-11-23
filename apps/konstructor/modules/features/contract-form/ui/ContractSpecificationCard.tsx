'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useContractSpecification } from '../hooks/use-contract-specification';
import { SpecificationEditor } from './SpecificationEditor';

/** Спецификация договора (Приложение): основные строки, суммы и состав комплекта. */
export const ContractSpecificationCard = () => {
    const spec = useContractSpecification();

    return (
        <SectionCard
            title="Спецификация"
            description="Приложение к договору: наполнение, поставка, сроки. Серые строки собирает бэк."
            tone="complect"
            state={spec.error ? 'error' : undefined}
            message={spec.error}
        >
            <SpecificationEditor spec={spec} />
        </SectionCard>
    );
};
