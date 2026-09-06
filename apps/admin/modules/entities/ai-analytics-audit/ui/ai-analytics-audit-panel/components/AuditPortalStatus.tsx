'use client';

import Link from 'next/link';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import { formatAuditDateTime } from '../../../lib/audit-format.util';
import type { AuditPortalState } from '../types';

interface AuditPortalStatusProps {
    portal: AuditPortalState;
}

/**
 * Состояние портала бейджами: включена ли AI-аналитика, разрешён ли
 * аудит, дата последнего снапшота. Если AI-аналитика включена, а аудит
 * запрещён — подсказка бэка (about.access) и ссылка на настройки
 * приложений портала. Выключенную AI-аналитику объясняет алерт формы.
 */
export const AuditPortalStatus = ({ portal }: AuditPortalStatusProps) => {
    if (portal.isLoading) {
        return (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <MicroSpinner />
                {AUDIT_TEXT.statusLoading}
            </span>
        );
    }
    if (!portal.status) return null;

    const { aiAnalyticsEnabled, auditEnabled, lastSnapshotAt } = portal.status;
    const showAuditHint = aiAnalyticsEnabled && !auditEnabled;

    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <ToneBadge
                    tone={aiAnalyticsEnabled ? 'success' : 'destructive'}
                    variant="soft"
                >
                    {aiAnalyticsEnabled
                        ? AUDIT_TEXT.aiEnabled
                        : AUDIT_TEXT.aiDisabled}
                </ToneBadge>
                <ToneBadge
                    tone={auditEnabled ? 'success' : 'destructive'}
                    variant="soft"
                >
                    {auditEnabled
                        ? AUDIT_TEXT.auditEnabled
                        : AUDIT_TEXT.auditDisabled}
                </ToneBadge>
                <span>
                    {AUDIT_TEXT.lastSnapshot}:{' '}
                    {lastSnapshotAt
                        ? formatAuditDateTime(lastSnapshotAt)
                        : AUDIT_TEXT.noLastSnapshot}
                </span>
            </div>
            {showAuditHint && (
                <p className="max-w-xl text-xs text-muted-foreground">
                    {portal.accessText ?? AUDIT_TEXT.runDisabledHint}{' '}
                    {portal.settingsHref && (
                        <Link
                            href={portal.settingsHref}
                            className="text-primary underline-offset-2 hover:underline"
                        >
                            {AUDIT_TEXT.openPortalSettings}
                        </Link>
                    )}
                </p>
            )}
        </div>
    );
};
