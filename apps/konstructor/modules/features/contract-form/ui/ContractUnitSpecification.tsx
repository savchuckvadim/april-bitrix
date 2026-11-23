'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';
import type { ContractUnit } from '@/modules/entities/contract-document';
import { useContractUnitSpecification } from '../hooks/use-contract-unit-specification';
import { SpecificationEditor } from './SpecificationEditor';

export interface ContractUnitSpecificationProps {
    unit: ContractUnit;
}

/** Спецификация договора варианта: свёрнута по умолчанию, значения правятся здесь же. */
export const ContractUnitSpecification = ({ unit }: ContractUnitSpecificationProps) => {
    const spec = useContractUnitSpecification(unit.key);

    return (
        <Collapsible open={spec.isOpen} onOpenChange={spec.setOpen} className="flex flex-col gap-3">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="self-start">
                    <ChevronDown
                        className={spec.isOpen ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'}
                    />
                    {spec.isOpen ? 'Свернуть спецификацию' : 'Спецификация договора'}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3">
                {spec.error ? <p className="text-sm text-destructive">{spec.error}</p> : null}
                <SpecificationEditor spec={spec} idPrefix={`spec-${unit.key}`} />
            </CollapsibleContent>
        </Collapsible>
    );
};
