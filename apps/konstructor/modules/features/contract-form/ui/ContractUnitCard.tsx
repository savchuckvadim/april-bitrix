'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { ContractUnit } from '@/modules/entities/contract-document';
import { ContractUnitGenerate } from './ContractUnitGenerate';
import { ContractUnitNumberField } from './ContractUnitNumberField';
import { ContractUnitSpecification } from './ContractUnitSpecification';
import { ContractUnitSummary } from './ContractUnitSummary';

export interface ContractUnitCardProps {
    unit: ContractUnit;
}

/**
 * Карточка договора одного варианта комплекта: название, шапка, номер,
 * свёрнутая спецификация и «Сформировать». Открытый вариант помечен и
 * выделен кромкой: его набор строк идёт в договор из живого состояния.
 */
export const ContractUnitCard = ({ unit }: ContractUnitCardProps) => (
    <SectionCard
        title={unit.title}
        tone="complect"
        accent={unit.isOpen}
        actions={
            unit.isOpen ? (
                <ToneBadge
                    tone="primary"
                    variant="soft"
                    size="sm"
                    title="Договор собирается по набору строк, который сейчас открыт в конструкторе"
                >
                    Сейчас редактируется
                </ToneBadge>
            ) : null
        }
        footer={<ContractUnitGenerate unit={unit} />}
    >
        <ContractUnitSummary summary={unit.summary} />
        <ContractUnitNumberField unit={unit} />
        <ContractUnitSpecification unit={unit} />
    </SectionCard>
);
