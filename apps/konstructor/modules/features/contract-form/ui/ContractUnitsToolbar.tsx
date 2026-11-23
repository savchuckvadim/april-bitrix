'use client';

import { FileSignature } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { useContractUnits } from '../hooks/use-contract-units';

/**
 * Над списком договоров: пояснение режима «Все варианты одним договором», «Сформировать все
 * договоры», блокер и счётчик готовых.
 */
export const ContractUnitsToolbar = () => {
    const contracts = useContractUnits();

    return (
        <SectionCard
            title="Договоры по вариантам"
            description="У каждого варианта комплекта свой договор: номер, спецификация и формирование."
            tone="complect"
        >
            {contracts.isSingleContract ? (
                <p className="text-sm text-muted-foreground">{contracts.singleContractNote}</p>
            ) : null}
            <Button
                onClick={contracts.generateAll}
                disabled={Boolean(contracts.blocker) || contracts.isGenerating || contracts.isFormLoading}
            >
                <FileSignature className="h-4 w-4" />
                {contracts.isGenerating ? 'Формирую…' : 'Сформировать все договоры'}
            </Button>
            {contracts.blocker ? <p className="text-xs text-muted-foreground">{contracts.blocker}</p> : null}
            {contracts.doneCount ? (
                <p className="text-xs text-muted-foreground">
                    Сформировано договоров: {contracts.doneCount} из {contracts.units.length}
                </p>
            ) : null}
        </SectionCard>
    );
};
