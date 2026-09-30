'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { BACKTEST_TEXT } from '../../consts/ai-analytics-model.const';
import { toBacktestView } from '../../lib/forecast-backtest-view.util';
import type { ModelForecastBacktestResult } from '../../model';
import { BacktestTable } from './components/BacktestTable';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';

interface ForecastBacktestCardProps {
    domain?: string;
    query: ModelQueryLike<ModelForecastBacktestResult>;
}

const selectView = (data: ModelForecastBacktestResult) => {
    const view = toBacktestView(data.items);
    return view.latest === null ? null : { ...view, latest: view.latest };
};

/**
 * «Точность прогноза»: сводка по свежей проверке (теневые месяцы,
 * попадание в вилку) и таблица по месяцам — статус, покрытие с
 * интервалом, отношения ошибок к простым прогнозам, причины.
 */
export const ForecastBacktestCard = ({ domain, query }: ForecastBacktestCardProps) => (
    <SectionCard
        title={BACKTEST_TEXT.title}
        description={BACKTEST_TEXT.description}
        contentClassName="space-y-4"
    >
        <ModelQueryState
            domain={domain}
            query={query}
            select={selectView}
            emptyHint={BACKTEST_TEXT.emptyHint}
        >
            {view => (
                <>
                    <MetricList metrics={view.latest} />
                    <BacktestTable rows={view.rows} />
                </>
            )}
        </ModelQueryState>
    </SectionCard>
);
