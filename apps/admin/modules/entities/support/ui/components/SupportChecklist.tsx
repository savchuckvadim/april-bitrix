import { GuideChecklist } from '@/modules/shared/ui/guide';
import { SUPPORT_TEXT } from '../../consts/support.const';
import type { SupportGuideCheck } from '../../model';

/** «Что осталось, чтобы заработало»: живые пункты и проверки вручную. */
export const SupportChecklist = ({ checks }: { checks: SupportGuideCheck[] }) => (
    <GuideChecklist
        checks={checks}
        title={SUPPORT_TEXT.checklistTitle}
        description={SUPPORT_TEXT.checklistDescription}
        summaryLabel={SUPPORT_TEXT.checklistSummary}
    />
);
