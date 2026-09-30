'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { QUALITY_LINK_TEXT } from '../../consts/ai-analytics-model.const';
import { toQualityLinkView } from '../../lib/quality-link-view.util';
import type { ModelQualityLinkResult } from '../../model';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';
import { ReasonList } from './shared/ReasonList';
import { SnapshotMeta } from './shared/SnapshotMeta';

interface QualityLinkCardProps {
    domain?: string;
    query: ModelQueryLike<ModelQualityLinkResult>;
}

const selectView = (data: ModelQualityLinkResult) =>
    data.latest === null ? null : toQualityLinkView(data.latest);

/**
 * «Связь качества с результатом»: статус, выборка, оценки с интервалами,
 * надёжность, калибровка, проверка на подставных данных, серия гейта и
 * сколько пересчётов осталось до публикации.
 */
export const QualityLinkCard = ({ domain, query }: QualityLinkCardProps) => (
    <SectionCard
        title={QUALITY_LINK_TEXT.title}
        description={QUALITY_LINK_TEXT.description}
        contentClassName="space-y-4"
    >
        <ModelQueryState
            domain={domain}
            query={query}
            select={selectView}
            emptyHint={QUALITY_LINK_TEXT.emptyHint}
        >
            {view => (
                <>
                    <SnapshotMeta
                        status={view.status}
                        month={view.month}
                        generatedAt={view.generatedAt}
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <MetricList title={QUALITY_LINK_TEXT.sample} metrics={view.sample} />
                        <MetricList title={QUALITY_LINK_TEXT.estimates} metrics={view.estimates} />
                        <MetricList title={QUALITY_LINK_TEXT.checks} metrics={view.checks} />
                        <MetricList title={QUALITY_LINK_TEXT.gate} metrics={view.gate} />
                    </div>
                    <ReasonList reasons={view.reasons} />
                </>
            )}
        </ModelQueryState>
    </SectionCard>
);
