'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { STAGE_HISTORY_PROBE_TEXT } from '../../../consts/ai-analytics-audit.const';
import type { StageHistoryProbeView } from '../../../lib/stage-history-probe.util';

interface StageHistoryProbeResultProps {
    view: StageHistoryProbeView;
}

/**
 * Результат пробы карточкой в тон итога: бейджи доступности и «достаточно»,
 * вывод бэка крупно, ошибка Bitrix (если метод недоступен), поля глубины
 * и объёма — сеткой.
 */
export const StageHistoryProbeResult = ({
    view,
}: StageHistoryProbeResultProps) => (
    <SectionCard
        title={STAGE_HISTORY_PROBE_TEXT.resultTitle}
        tone={view.tone}
        accent
        density="compact"
        actions={
            <>
                <ToneBadge tone={view.availability.tone} variant="soft">
                    {view.availability.label}
                </ToneBadge>
                <ToneBadge tone={view.enough.tone} variant="soft">
                    {view.enough.label}
                </ToneBadge>
            </>
        }
    >
        <p className="text-lg font-semibold leading-snug">{view.hint}</p>
        {view.error && (
            <p className="text-sm text-destructive">
                {STAGE_HISTORY_PROBE_TEXT.bitrixError}: {view.error}
            </p>
        )}
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {view.fields.map(field => (
                <div key={field.key}>
                    <dt className="text-xs text-muted-foreground">
                        {field.title}
                    </dt>
                    <dd className="font-medium tabular-nums">{field.value}</dd>
                </div>
            ))}
        </dl>
    </SectionCard>
);
