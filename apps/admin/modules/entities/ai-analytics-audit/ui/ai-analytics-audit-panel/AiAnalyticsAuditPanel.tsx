'use client';

import { AUDIT_TEXT } from '../../consts/ai-analytics-audit.const';
import { AuditAboutCard } from '../audit-about-card';
import { AuditResultView } from '../audit-result-view';
import { AuditNotice } from './components/AuditNotice';
import { AuditRunForm } from './components/AuditRunForm';
import { useAiAnalyticsAuditPanel } from './hooks/use-ai-analytics-audit-panel';

/**
 * Раздел «AI-аналитика ОП → Аудит данных»: форма запуска по порталу,
 * самоописание аудита (всегда, сворачиваемое) и результат — свежий расчёт
 * или последний снапшот.
 */
export const AiAnalyticsAuditPanel = () => {
    const panel = useAiAnalyticsAuditPanel();

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{AUDIT_TEXT.pageTitle}</h1>

            <AuditRunForm
                form={panel.form}
                actions={panel.formActions}
                controls={panel.controls}
                portal={panel.portal}
            />

            {panel.runErrorMessage && (
                <AuditNotice
                    tone="error"
                    title={
                        panel.isRunForbidden
                            ? AUDIT_TEXT.runForbiddenTitle
                            : AUDIT_TEXT.runError
                    }
                    message={panel.runErrorMessage}
                />
            )}
            {panel.latestErrorMessage && (
                <AuditNotice
                    tone="error"
                    title={AUDIT_TEXT.latestError}
                    message={panel.latestErrorMessage}
                />
            )}
            {panel.isLatestNotFound && (
                <AuditNotice tone="info" message={AUDIT_TEXT.noSnapshots} />
            )}

            <AuditAboutCard
                about={panel.about}
                isLoading={panel.isAboutLoading}
                isError={panel.isAboutError}
                open={panel.aboutOpen}
                onOpenChange={panel.setAboutOpen}
            />

            {panel.result && <AuditResultView result={panel.result} />}
        </div>
    );
};
