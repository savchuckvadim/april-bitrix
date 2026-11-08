import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import {
    CHECK_STATUS_LABEL,
    CHECK_STATUS_TONE,
    summarizeChecklist,
} from './guide-view';
import type { GuideCheck } from './guide.types';
import { GuideLink } from './GuideLink';

interface GuideChecklistProps {
    checks: readonly GuideCheck[];
    title: string;
    description: string;
    /** Итог в шапке: «готово 5 из 7». */
    summaryLabel: (done: number, total: number) => string;
}

/** «Что осталось, чтобы заработало»: живые пункты и проверки вручную. */
export const GuideChecklist = ({
    checks,
    title,
    description,
    summaryLabel,
}: GuideChecklistProps) => {
    const summary = summarizeChecklist(checks);
    return (
        <SectionCard
            title={title}
            description={description}
            actions={
                <ToneBadge tone={summary.todo ? 'warning' : 'success'}>
                    {summaryLabel(summary.done, summary.done + summary.todo)}
                </ToneBadge>
            }
        >
            <ul className="space-y-3">
                {checks.map(check => (
                    <li key={check.key} className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <ToneBadge tone={CHECK_STATUS_TONE[check.status]} size="sm">
                                {CHECK_STATUS_LABEL[check.status]}
                            </ToneBadge>
                            <span className="text-sm font-medium">{check.title}</span>
                        </div>
                        <MarkdownView
                            text={check.hint}
                            className="text-sm text-muted-foreground"
                        />
                        {check.link && <GuideLink link={check.link} />}
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
};
