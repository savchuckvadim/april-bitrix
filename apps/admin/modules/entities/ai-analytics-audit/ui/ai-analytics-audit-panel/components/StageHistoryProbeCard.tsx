'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { STAGE_HISTORY_PROBE_TEXT } from '../../../consts/ai-analytics-audit.const';
import { AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS } from '../../../model';
import { useStageHistoryProbePanel } from '../hooks/use-stage-history-probe-panel';
import { AuditNotice } from './AuditNotice';
import { MonthsField } from './MonthsField';
import { StageHistoryProbeResult } from './StageHistoryProbeResult';

interface StageHistoryProbeCardProps {
    /** Портал из формы запуска аудита — своего выбора у блока нет. */
    domain?: string;
}

/**
 * Блок «История стадий сделок»: окно в месяцах, кнопка «Проверить» и
 * результат пробы crm.stagehistory.list по выбранному порталу. Признаком
 * аудита не ограничен — только SUPER_USER, как и вся ручка.
 */
export const StageHistoryProbeCard = ({
    domain,
}: StageHistoryProbeCardProps) => {
    const panel = useStageHistoryProbePanel(domain);

    return (
        <SectionCard
            title={STAGE_HISTORY_PROBE_TEXT.title}
            description={STAGE_HISTORY_PROBE_TEXT.description}
            footer={
                <div className="flex w-full flex-wrap items-center gap-3">
                    <Button
                        disabled={!panel.controls.canProbe}
                        onClick={panel.controls.probe}
                    >
                        {panel.controls.isProbing
                            ? STAGE_HISTORY_PROBE_TEXT.probing
                            : STAGE_HISTORY_PROBE_TEXT.probe}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {domain
                            ? `${STAGE_HISTORY_PROBE_TEXT.portal}: ${domain}`
                            : STAGE_HISTORY_PROBE_TEXT.noPortal}
                    </span>
                </div>
            }
            contentClassName="space-y-4"
        >
            <div className="grid gap-4 md:grid-cols-2">
                <MonthsField
                    id="stage-history-probe-months"
                    label={STAGE_HISTORY_PROBE_TEXT.months}
                    value={panel.form.monthsRaw}
                    isValid={panel.form.isMonthsValid}
                    min={AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS.minMonths}
                    max={AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS.maxMonths}
                    hint={STAGE_HISTORY_PROBE_TEXT.monthsHint}
                    invalidHint={STAGE_HISTORY_PROBE_TEXT.monthsInvalid}
                    onChange={panel.setMonthsRaw}
                />
            </div>

            {panel.errorMessage && (
                <AuditNotice
                    tone="error"
                    title={STAGE_HISTORY_PROBE_TEXT.requestError}
                    message={panel.errorMessage}
                />
            )}

            {panel.view && <StageHistoryProbeResult view={panel.view} />}
        </SectionCard>
    );
};
