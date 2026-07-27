'use client';

import React from 'react';
import type { RatingDataset } from '@/modules/feature/report-rating';
import type { ConversionChainConfig } from '@/modules/feature/report-conversions';
import {
    ConversionFunnelChart,
    ConversionFunnelStrip,
    ConversionTable,
    useConversionsComputation,
} from '@/modules/feature/report-conversions';
import { useAppSelector, selectIsPublic } from '@/modules/app';

interface ConversionsSummaryProps {
    dataset: RatingDataset;
    config: ConversionChainConfig;
}

/** Сводный блок вкладки «Конверсии»: воронка команды + таблица по менеджерам. */
export const ConversionsSummary: React.FC<ConversionsSummaryProps> = ({
    dataset,
    config,
}) => {
    const { result } = useConversionsComputation(
        dataset,
        config.codes,
        config.method,
    );
    const isPublic = useAppSelector(selectIsPublic);

    if (!result.stepDefs.length) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                Выберите минимум два показателя, чтобы увидеть конверсии
            </p>
        );
    }

    return (
        <>
            <ConversionFunnelStrip
                dataset={dataset}
                codes={config.codes}
                method={config.method}
            />
            <ConversionFunnelChart
                dataset={dataset}
                codes={config.codes}
                method={config.method}
                title="Воронка команды"
            />
            <ConversionTable result={result} withLink={!isPublic} />
        </>
    );
};
