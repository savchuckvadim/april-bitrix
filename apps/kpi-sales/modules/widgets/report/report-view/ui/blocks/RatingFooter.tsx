'use client';
import React from 'react';
import {
    EntityRatingChart,
    RatingDataset,
} from '@/modules/feature/report-rating';
import { StructureSection } from '@/modules/feature/report-tabs';

interface RatingFooterProps {
    dataset: RatingDataset;
    /** Подпись сущностей в заголовке: «отделы», «группы (звонки)» и т.п. */
    entityLabel: string;
    sections: StructureSection[];
    /** Виджет по сотрудникам; по умолчанию — рейтинг сотрудников. */
    managersWidget?: React.ReactNode;
}

/** Футер вкладки разбивки: рейтинг сущностей + рейтинг/виджет сотрудников. */
export const RatingFooter = ({
    dataset,
    entityLabel,
    sections,
    managersWidget,
}: RatingFooterProps) => (
    <div className="mt-6 space-y-4">
        <EntityRatingChart
            title={`Победители — ${entityLabel}`}
            dataset={dataset}
            sections={sections}
        />
        {managersWidget ?? (
            <EntityRatingChart
                title="Победители — сотрудники"
                dataset={dataset}
            />
        )}
    </div>
);
