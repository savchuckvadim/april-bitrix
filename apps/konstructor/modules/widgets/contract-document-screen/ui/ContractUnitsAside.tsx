'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ProviderChoice } from '@/modules/features/provider-select';

export interface ContractUnitsAsideProps {
    /** Сколько договоров формируется: по одному на вариант комплекта */
    unitsCount: number;
}

/**
 * Правая колонка договоров по вариантам: поставщик один на все договоры.
 * Сводки сборки здесь нет: у каждого договора своя шапка в карточке.
 */
export const ContractUnitsAside = ({ unitsCount }: ContractUnitsAsideProps) => (
    <SectionCard title="Договоры" tone="complect" accent footer={<ProviderChoice />}>
        <p className="text-sm">Вариантов комплекта: {unitsCount}</p>
        <p className="text-xs text-muted-foreground">
            Поля сделки, реквизиты клиента и поставщик общие для всех договоров.
        </p>
    </SectionCard>
);
