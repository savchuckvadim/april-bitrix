'use client';

import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import type {
    AuditFormActions,
    AuditFormState,
    AuditPortalState,
    AuditRunControls,
} from '../types';
import { AuditNotice } from './AuditNotice';
import { AuditPortalStatus } from './AuditPortalStatus';
import { AuditRunParams } from './AuditRunParams';

interface AuditRunFormProps {
    form: AuditFormState;
    actions: AuditFormActions;
    controls: AuditRunControls;
    portal: AuditPortalState;
}

/**
 * Форма запуска: портал, параметры расчёта, кнопки. Портал с выключенной
 * AI-аналитикой параметров и кнопки запуска не показывает — только алерт
 * со ссылкой на настройки; последний снапшот доступен всегда.
 */
export const AuditRunForm = ({
    form,
    actions,
    controls,
    portal,
}: AuditRunFormProps) => {
    const isPortalAiDisabled = portal.status?.aiAnalyticsEnabled === false;

    return (
        <SectionCard
            title={AUDIT_TEXT.formTitle}
            description={AUDIT_TEXT.formDescription}
            footer={
                <div className="flex w-full flex-wrap items-center gap-3">
                    {!isPortalAiDisabled && (
                        <Button
                            disabled={!controls.canRun}
                            onClick={controls.run}
                            title={
                                portal.status?.auditEnabled === false
                                    ? (portal.accessText ?? AUDIT_TEXT.runDisabledHint)
                                    : undefined
                            }
                        >
                            {controls.isRunning
                                ? AUDIT_TEXT.running
                                : AUDIT_TEXT.run}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        disabled={!controls.canShowLatest}
                        onClick={controls.showLatest}
                    >
                        {controls.isLatestLoading
                            ? AUDIT_TEXT.loadingLatest
                            : AUDIT_TEXT.showLatest}
                    </Button>
                    <div className="ml-auto">
                        <AuditPortalStatus portal={portal} />
                    </div>
                </div>
            }
        >
            <div className="grid gap-4 md:grid-cols-2">
                <FieldCombobox
                    id="audit-domain"
                    label={AUDIT_TEXT.portal}
                    options={form.portalOptions}
                    value={form.domain}
                    onChange={actions.selectDomain}
                    placeholder={AUDIT_TEXT.portalPlaceholder}
                    searchPlaceholder={AUDIT_TEXT.portalSearch}
                    emptyText={AUDIT_TEXT.portalEmpty}
                />
                {!isPortalAiDisabled && (
                    <AuditRunParams form={form} actions={actions} />
                )}
            </div>

            {isPortalAiDisabled && (
                <AuditNotice
                    tone="warning"
                    title={AUDIT_TEXT.portalAiDisabledTitle}
                    message={portal.accessText ?? AUDIT_TEXT.portalAiDisabledHint}
                    action={
                        portal.settingsHref && (
                            <Link
                                href={portal.settingsHref}
                                className="text-sm text-primary underline-offset-2 hover:underline"
                            >
                                {AUDIT_TEXT.openPortalSettings}
                            </Link>
                        )
                    }
                />
            )}
        </SectionCard>
    );
};
