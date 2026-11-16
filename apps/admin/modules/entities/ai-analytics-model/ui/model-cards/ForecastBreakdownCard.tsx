'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { BREAKDOWN_TEXT } from '../../consts/ai-analytics-model.const';
import { toBreakdownView } from '../../lib/forecast-breakdown-view.util';
import type { ModelForecastBreakdownResult } from '../../model';
import { BreakdownTable } from './components/BreakdownTable';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';

interface ForecastBreakdownCardProps {
    domain?: string;
    query: ModelQueryLike<ModelForecastBreakdownResult>;
}

/**
 * «Разложение прогноза»: из чего сложилась середина прогноза отдела за
 * последний день расчёта — закрыто, открытые сделки, новые встречи — и то
 * же по каждому менеджеру, с входами расчёта и сделками с наибольшим
 * вкладом. По ней ищут, какое слагаемое завышает прогноз.
 */
export const ForecastBreakdownCard = ({
    domain,
    query,
}: ForecastBreakdownCardProps) => (
    <SectionCard
        title={BREAKDOWN_TEXT.title}
        description={BREAKDOWN_TEXT.description}
        contentClassName="space-y-4"
    >
        <ModelQueryState
            domain={domain}
            query={query}
            select={toBreakdownView}
            emptyHint={BREAKDOWN_TEXT.emptyHint}
        >
            {view => (
                <>
                    <MetricList
                        title={BREAKDOWN_TEXT.departmentTitle(view.day)}
                        metrics={view.department}
                    />
                    {view.note && (
                        <p className="text-xs text-muted-foreground">
                            {view.note}
                        </p>
                    )}
                    {view.rows.length > 0 ? (
                        <BreakdownTable rows={view.rows} />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {BREAKDOWN_TEXT.noManagers}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {BREAKDOWN_TEXT.howToRead}
                    </p>
                </>
            )}
        </ModelQueryState>
    </SectionCard>
);
