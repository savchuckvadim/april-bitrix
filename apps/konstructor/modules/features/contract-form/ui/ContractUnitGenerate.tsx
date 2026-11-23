'use client';

import { Check, FileSignature } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { ContractUnit } from '@/modules/entities/contract-document';
import { useContractUnit } from '../hooks/use-contract-unit';
import { ContractGenerateStatus } from './ContractGenerateStatus';

export interface ContractUnitGenerateProps {
    unit: ContractUnit;
}

/**
 * «Сформировать» договор одного варианта: ошибка и ссылка на результат под
 * кнопкой. Кнопка вторичная и по ширине содержимого: главная на экране одна,
 * «Сформировать все договоры». Причина блокировки общая для всех договоров и
 * написана над списком, здесь она в подсказке кнопки.
 */
export const ContractUnitGenerate = ({ unit }: ContractUnitGenerateProps) => {
    const contract = useContractUnit(unit);

    return (
        <div className="flex w-full flex-col gap-2">
            <Button
                variant="outline"
                className="self-start"
                onClick={contract.run}
                disabled={contract.isDisabled}
                title={contract.blocker ?? undefined}
            >
                {contract.isDone ? <Check className="h-4 w-4" /> : <FileSignature className="h-4 w-4" />}
                {contract.isGenerating ? 'Формирую…' : 'Сформировать'}
            </Button>
            <ContractGenerateStatus
                blocker={null}
                error={contract.error}
                isDone={contract.isDone}
                link={contract.link}
                documentName={contract.documentName}
                savedToDisk={contract.savedToDisk}
            />
        </div>
    );
};
