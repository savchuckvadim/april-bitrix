'use client';

import { Spinner } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useContractSpecification } from '../hooks/use-contract-specification';
import { SpecificationDetails } from './SpecificationDetails';
import { SpecificationField } from './SpecificationField';
import { SpecificationSums } from './SpecificationSums';

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
            {spec.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    Собираю спецификацию…
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <SpecificationSums sums={spec.sums} />
                    {spec.items.map(item => (
                        <SpecificationField key={item.code} item={item} onChange={spec.setValue} />
                    ))}
                    <SpecificationDetails
                        sections={spec.sections}
                        open={spec.isExpanded}
                        onOpenChange={spec.setExpanded}
                        onChange={spec.setValue}
                    />
                </div>
            )}
        </SectionCard>
    );
};
