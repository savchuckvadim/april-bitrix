'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { EFFECT_TEXT } from '../../consts/ai-analytics-model.const';
import { toEffectView } from '../../lib/recommendation-effect-view.util';
import type { ModelRecommendationEffectResult } from '../../model';
import {
    EffectEdgesTable,
    EffectLeversTable,
} from './components/EffectTables';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';
import { ReasonList } from './shared/ReasonList';
import { SnapshotMeta } from './shared/SnapshotMeta';

interface RecommendationEffectCardProps {
    domain?: string;
    query: ModelQueryLike<ModelRecommendationEffectResult>;
}

const selectView = (data: ModelRecommendationEffectResult) =>
    data.latest === null ? null : toEffectView(data.latest);

/**
 * «Эффект советов»: выдано, выполнено, несогласия с долями, до и после
 * по шагам воронки, свод по направлениям и итог гейта с причинами.
 */
export const RecommendationEffectCard = ({
    domain,
    query,
}: RecommendationEffectCardProps) => (
    <SectionCard
        title={EFFECT_TEXT.title}
        description={EFFECT_TEXT.description}
        contentClassName="space-y-4"
    >
        <ModelQueryState
            domain={domain}
            query={query}
            select={selectView}
            emptyHint={EFFECT_TEXT.emptyHint}
        >
            {view => (
                <>
                    <SnapshotMeta
                        status={view.gate}
                        month={view.month}
                        generatedAt={view.generatedAt}
                    />
                    <p className="text-xs text-muted-foreground">
                        {EFFECT_TEXT.issuedMonths}: {view.issuedMonths}
                    </p>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <MetricList metrics={view.metrics} />
                        <ReasonList reasons={view.reasons} />
                    </div>
                    <EffectEdgesTable edges={view.edges} />
                    <EffectLeversTable levers={view.levers} />
                </>
            )}
        </ModelQueryState>
    </SectionCard>
);
