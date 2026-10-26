import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { SUPPORT_TEXT } from '../../consts/support.const';
import {
    CHECK_STATUS_LABEL,
    CHECK_STATUS_TONE,
    summarizeChecklist,
} from '../../lib/support-view';
import type { SupportGuideCheck } from '../../model';
import { SupportLink } from './SupportLink';

/** «Что осталось, чтобы заработало»: живые пункты и проверки вручную. */
export const SupportChecklist = ({ checks }: { checks: SupportGuideCheck[] }) => {
    const summary = summarizeChecklist(checks);
    return (
        <SectionCard
            title={SUPPORT_TEXT.checklistTitle}
            description={SUPPORT_TEXT.checklistDescription}
            actions={
                <ToneBadge tone={summary.todo ? 'warning' : 'success'}>
                    {SUPPORT_TEXT.checklistSummary(
                        summary.done,
                        summary.done + summary.todo,
                    )}
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
                        {check.link && <SupportLink link={check.link} />}
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
};
