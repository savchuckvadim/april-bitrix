'use client';

import type { AiOwnerReportLeak } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { AiCardLink } from '../components/AiCardLink';
import { AiOwnerReportSourceBadge } from './AiOwnerReportSection';

interface AiOwnerReportLeaksProps {
    leaks: AiOwnerReportLeak[];
}

const T = AI_OWNER_REPORT_TEXT.leak;

/** Три самых больших утечки: масштаб, деньги, природа, что сделать, примеры. */
export const AiOwnerReportLeaks = ({ leaks }: AiOwnerReportLeaksProps) => (
    <div className="grid gap-3 lg:grid-cols-3">
        {leaks.map(leak => (
            <article
                key={leak.code}
                className="space-y-2 rounded-md border border-border/60 p-3 text-sm"
            >
                <h5 className="font-semibold leading-snug">{leak.title}</h5>
                <p>{leak.text}</p>
                <dl className="space-y-1 text-xs">
                    <div>
                        <dt className="font-medium text-muted-foreground">{T.scale}</dt>
                        <dd>{leak.scale}</dd>
                    </div>
                    {leak.money && (
                        <div>
                            <dt className="font-medium text-muted-foreground">{T.money}</dt>
                            <dd>{leak.money}</dd>
                        </div>
                    )}
                    <div>
                        <dt className="font-medium text-muted-foreground">{T.nature}</dt>
                        <dd>{leak.nature}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-muted-foreground">{T.action}</dt>
                        <dd>{leak.action}</dd>
                    </div>
                </dl>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {leak.exampleLinks.map((link, index) => (
                        <AiCardLink
                            key={link}
                            href={link}
                            label={T.example(index + 1)}
                            title={T.linkTitle}
                        />
                    ))}
                    <AiOwnerReportSourceBadge source={leak.source} />
                </div>
            </article>
        ))}
    </div>
);
