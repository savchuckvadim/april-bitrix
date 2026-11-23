'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { BuildSummary } from '@/modules/features/build-summary';
import { ContractGenerateButton } from '@/modules/features/contract-form';
import { ProviderChoice } from '@/modules/features/provider-select';

/** Правая колонка договора по живому состоянию: сводка сборки, поставщик и «Сформировать договор». */
export const ContractSingleAside = () => (
    <SectionCard
        title="Сборка"
        tone="complect"
        accent
        footer={
            <div className="flex w-full flex-col gap-3">
                <ProviderChoice />
                <ContractGenerateButton />
            </div>
        }
    >
        <BuildSummary />
    </SectionCard>
);
