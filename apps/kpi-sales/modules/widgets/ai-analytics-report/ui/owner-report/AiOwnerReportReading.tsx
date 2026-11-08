'use client';

import { ToneBadge } from '@workspace/april-ui';
import type {
    AiOwnerReportAttention,
    AiOwnerReportGlossaryItem,
} from '@/modules/entities/ai-analytics';
import {
    AI_OWNER_REPORT_ATTENTION_ACTION,
    AI_OWNER_REPORT_ATTENTION_KIND,
    AI_OWNER_REPORT_TONE,
} from '../../lib/ai-owner-report-tone';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';

/** «На что обратить внимание»: что не так и одно действие. */
export const AiOwnerReportAttentionBlock = ({
    items,
}: {
    items: AiOwnerReportAttention[];
}) =>
    items.length === 0 ? null : (
        <section className="space-y-2 rounded-md border-l-4 border-l-amber-500 bg-amber-500/5 px-4 py-3">
            <h4 className="text-sm font-semibold">
                {AI_OWNER_REPORT_TEXT.sections.attention}
            </h4>
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item.title} className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <ToneBadge
                                tone={
                                    AI_OWNER_REPORT_TONE[item.tone] ?? 'neutral'
                                }
                                variant="soft"
                                size="sm"
                            >
                                {AI_OWNER_REPORT_ATTENTION_KIND[item.tone]}
                            </ToneBadge>
                            <span className="text-sm font-medium">
                                {item.title}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {AI_OWNER_REPORT_ATTENTION_ACTION}
                            {item.action}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );

/** «Как читать отчёт»: термины коротко, для того, кто видит отчёт впервые. */
export const AiOwnerReportGlossary = ({
    items,
}: {
    items: AiOwnerReportGlossaryItem[];
}) => (
    <dl className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        {items.map(item => (
            <div key={item.term}>
                <dt className="text-sm font-medium">{item.term}</dt>
                <dd className="text-xs text-muted-foreground">
                    {item.meaning}
                </dd>
            </div>
        ))}
    </dl>
);
