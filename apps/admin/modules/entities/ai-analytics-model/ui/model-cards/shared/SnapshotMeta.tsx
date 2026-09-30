import { ToneBadge } from '@workspace/april-ui/badges';
import { MODEL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { ModelStatusLabel } from '../../../consts/ai-analytics-model.labels.const';

interface SnapshotMetaProps {
    status: ModelStatusLabel;
    month: string;
    generatedAt: string;
}

/** Шапка снапшота: статус бэйджем, месяц расчёта и момент формирования. */
export const SnapshotMeta = ({ status, month, generatedAt }: SnapshotMetaProps) => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <ToneBadge tone={status.tone} variant="soft">
            {status.label}
        </ToneBadge>
        <span>
            {MODEL_TEXT.month}: {month}
        </span>
        <span>
            {MODEL_TEXT.generatedAt}: {generatedAt}
        </span>
    </div>
);
