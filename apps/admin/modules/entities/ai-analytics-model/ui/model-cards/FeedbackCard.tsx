'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { FEEDBACK_TEXT, MODEL_TEXT } from '../../consts/ai-analytics-model.const';
import { toFeedbackView } from '../../lib/feedback-view.util';
import type { ModelFeedbackResult } from '../../model';
import {
    FeedbackKindsTable,
    FeedbackManagersTable,
} from './components/FeedbackTables';
import { MetricList } from './shared/MetricList';
import { ModelQueryState, type ModelQueryLike } from './shared/ModelQueryState';

interface FeedbackCardProps {
    domain?: string;
    query: ModelQueryLike<ModelFeedbackResult>;
    /** Период неверный — запроса нет, и «записей нет» было бы неправдой. */
    isPeriodValid: boolean;
}

const selectView = (data: ModelFeedbackResult) => {
    const view = toFeedbackView(data);
    return view.isEmpty ? null : view;
};

/**
 * «Обратная связь»: всего записей, доля «полезно», заменённые (смена
 * оценки, повторная метка), разрезы по видам и менеджерам за период.
 */
export const FeedbackCard = ({
    domain,
    query,
    isPeriodValid,
}: FeedbackCardProps) => (
    <SectionCard
        title={FEEDBACK_TEXT.title}
        description={FEEDBACK_TEXT.description}
        contentClassName="space-y-4"
    >
        {domain && !isPeriodValid ? (
            <p className="text-sm text-destructive">{MODEL_TEXT.periodInvalid}</p>
        ) : (
            <ModelQueryState
                domain={domain}
                query={query}
                select={selectView}
                emptyHint={FEEDBACK_TEXT.emptyHint}
            >
                {view => (
                    <>
                        <p className="text-xs text-muted-foreground">{view.period}</p>
                        <MetricList metrics={view.metrics} />
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                            {view.kinds.length > 0 && (
                                <FeedbackKindsTable kinds={view.kinds} />
                            )}
                            {view.managers.length > 0 && (
                                <FeedbackManagersTable managers={view.managers} />
                            )}
                        </div>
                    </>
                )}
            </ModelQueryState>
        )}
    </SectionCard>
);
