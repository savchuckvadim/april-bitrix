'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { POOL_TEXT } from '../../consts/ai-analytics-model.const';
import { toPoolView } from '../../lib/pool-view.util';
import type { ModelPoolStatusResult } from '../../model';
import { PoolVerdictsTable } from './components/PoolVerdictsTable';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';
import { ReasonList } from './shared/ReasonList';
import { SnapshotMeta } from './shared/SnapshotMeta';

interface PoolCardProps {
    domain?: string;
    query: ModelQueryLike<ModelPoolStatusResult>;
}

const selectView = (data: ModelPoolStatusResult) =>
    data.latest === null ? null : toPoolView(data.latest);

/**
 * «Пул порталов»: участвует ли портал, сколько участников, оценка по
 * пулу с расхождением порталов и меткой, причины пропусков и вердикты
 * по обезличенным ключам.
 */
export const PoolCard = ({ domain, query }: PoolCardProps) => (
    <SectionCard
        title={POOL_TEXT.title}
        description={POOL_TEXT.description}
        contentClassName="space-y-4"
    >
        <ModelQueryState
            domain={domain}
            query={query}
            select={selectView}
            emptyHint={POOL_TEXT.emptyHint}
        >
            {view => (
                <>
                    <SnapshotMeta
                        status={view.status}
                        month={view.month}
                        generatedAt={view.generatedAt}
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <MetricList metrics={view.metrics} />
                        {view.beta ? (
                            <MetricList title={POOL_TEXT.betaTitle} metrics={view.beta} />
                        ) : (
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">{POOL_TEXT.betaTitle}</h4>
                                <p className="text-sm text-muted-foreground">{POOL_TEXT.noBeta}</p>
                            </div>
                        )}
                    </div>
                    <ReasonList reasons={view.reasons} />
                    {view.verdicts.length > 0 && (
                        <PoolVerdictsTable verdicts={view.verdicts} />
                    )}
                </>
            )}
        </ModelQueryState>
    </SectionCard>
);
