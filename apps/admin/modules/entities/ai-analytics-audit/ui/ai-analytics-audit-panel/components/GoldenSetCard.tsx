'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { GOLDEN_SET_TEXT } from '../../../consts/ai-analytics-audit.const';
import { AI_ANALYTICS_GOLDEN_SET_DEFAULTS } from '../../../model';
import { useGoldenSetPanel } from '../hooks/use-golden-set-panel';
import { AuditNotice } from './AuditNotice';
import { GoldenSetTable } from './GoldenSetTable';
import { MonthsField } from './MonthsField';

interface GoldenSetCardProps {
    /** Портал из формы запуска аудита — своего выбора у блока нет. */
    domain?: string;
}

/**
 * Блок «Надёжность оценщика (test-retest)»: квота пар, кнопка запуска
 * повторного прогона (джоба в очереди CALL_REPORT), ответ постановки и
 * состав отчётов согласия портала по версиям промпта. Только SUPER_USER,
 * как и вся ручка.
 */
export const GoldenSetCard = ({ domain }: GoldenSetCardProps) => {
    const panel = useGoldenSetPanel(domain);

    return (
        <SectionCard
            title={GOLDEN_SET_TEXT.title}
            description={GOLDEN_SET_TEXT.description}
            footer={
                <div className="flex w-full flex-wrap items-center gap-3">
                    <Button
                        disabled={!panel.controls.canRun}
                        onClick={panel.controls.run}
                    >
                        {panel.controls.isRunning
                            ? GOLDEN_SET_TEXT.running
                            : GOLDEN_SET_TEXT.run}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!panel.controls.canRefresh}
                        onClick={panel.controls.refresh}
                    >
                        {panel.controls.isRefreshing
                            ? GOLDEN_SET_TEXT.refreshing
                            : GOLDEN_SET_TEXT.refresh}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {domain
                            ? `${GOLDEN_SET_TEXT.portal}: ${domain}`
                            : GOLDEN_SET_TEXT.noPortal}
                    </span>
                </div>
            }
            contentClassName="space-y-4"
        >
            <div className="grid gap-4 md:grid-cols-2">
                <MonthsField
                    id="golden-set-quota"
                    label={GOLDEN_SET_TEXT.quota}
                    value={panel.form.quotaRaw}
                    isValid={panel.form.isQuotaValid}
                    min={AI_ANALYTICS_GOLDEN_SET_DEFAULTS.minQuota}
                    max={AI_ANALYTICS_GOLDEN_SET_DEFAULTS.maxQuota}
                    hint={GOLDEN_SET_TEXT.quotaHint}
                    invalidHint={GOLDEN_SET_TEXT.quotaInvalid}
                    onChange={panel.setQuotaRaw}
                />
            </div>

            {!panel.runAvailable && (
                <AuditNotice
                    tone="warning"
                    message={panel.hint ?? GOLDEN_SET_TEXT.runUnavailable}
                />
            )}
            {panel.runErrorMessage && (
                <AuditNotice
                    tone="error"
                    title={GOLDEN_SET_TEXT.runError}
                    message={panel.runErrorMessage}
                />
            )}
            {panel.runView && (
                <AuditNotice
                    tone={panel.runView.tone}
                    title={panel.runView.title}
                    message={panel.runView.message}
                />
            )}
            {panel.listErrorMessage && (
                <AuditNotice
                    tone="error"
                    title={GOLDEN_SET_TEXT.listError}
                    message={panel.listErrorMessage}
                />
            )}

            {domain && !panel.isListLoading && !panel.listErrorMessage && (
                <GoldenSetTable
                    entries={panel.entries}
                    skipped={panel.skipped}
                />
            )}
        </SectionCard>
    );
};
