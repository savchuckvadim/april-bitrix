'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { SUPPORT_TEXT } from '../../consts/support.const';
import { useSupportPreview } from '../../lib/hooks/use-support';
import {
    formatWait,
    SIGNAL_KIND_LABEL,
    SIGNAL_KIND_TONE,
} from '../../lib/support-view';
import type { SupportMonitorPreview } from '../../model';
import { SupportLink } from './SupportLink';

/** «Проверить линию сейчас»: предпросмотр монитора без отправки. */
export const SupportPreviewCard = ({ domain }: { domain: string }) => {
    const preview = useSupportPreview();
    return (
        <SectionCard
            title={SUPPORT_TEXT.previewTitle}
            description={SUPPORT_TEXT.previewDescription}
            actions={
                <Button
                    size="sm"
                    disabled={preview.isPending}
                    onClick={() => preview.mutate(domain)}
                >
                    {preview.isPending
                        ? SUPPORT_TEXT.previewRunning
                        : SUPPORT_TEXT.previewButton}
                </Button>
            }
        >
            {preview.isError && (
                <HookNotice
                    tone="error"
                    title={SUPPORT_TEXT.previewError}
                    message={getApiErrorMessage(preview.error)}
                />
            )}
            {preview.data && <PreviewResult data={preview.data} />}
        </SectionCard>
    );
};

const PreviewResult = ({ data }: { data: SupportMonitorPreview }) => (
    <div className="space-y-4">
        {data.dryRun && (
            <p className="text-sm text-muted-foreground">{SUPPORT_TEXT.previewDryRun}</p>
        )}
        {data.warnings.map(warning => (
            <HookNotice key={warning} tone="warning" message={warning} />
        ))}

        <div className="space-y-2">
            <h3 className="text-sm font-semibold">{SUPPORT_TEXT.previewDialogsTitle}</h3>
            {data.dialogs.length === 0 && (
                <p className="text-sm text-muted-foreground">{SUPPORT_TEXT.previewNoDialogs}</p>
            )}
            {data.dialogs.map(dialog => (
                <div key={dialog.sessionId} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{dialog.clientName}</span>
                        {dialog.clientPortal && (
                            <span className="text-muted-foreground">{dialog.clientPortal}</span>
                        )}
                        <ToneBadge tone={dialog.waitedMinutes ? 'warning' : 'success'} size="sm">
                            {formatWait(dialog.waitedMinutes)}
                        </ToneBadge>
                        <span className="text-muted-foreground">
                            {dialog.operatorName ?? SUPPORT_TEXT.dialogNoOperator} · линия {dialog.lineId}
                        </span>
                    </div>
                    {dialog.pendingText && <p className="mt-1">«{dialog.pendingText}»</p>}
                    <div className="mt-1 flex flex-wrap gap-3">
                        <SupportLink link={{ title: SUPPORT_TEXT.dialogOpen, href: dialog.url }} />
                        {dialog.crmUrl && (
                            <SupportLink link={{ title: SUPPORT_TEXT.dialogCrm, href: dialog.crmUrl }} />
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-2">
            <h3 className="text-sm font-semibold">{SUPPORT_TEXT.previewSignalsTitle}</h3>
            {data.signals.length === 0 && (
                <p className="text-sm text-muted-foreground">{SUPPORT_TEXT.previewNoSignals}</p>
            )}
            {data.signals.map(signal => (
                <div key={`${signal.sessionId}-${signal.kind}`} className="rounded-md border p-3">
                    <ToneBadge tone={SIGNAL_KIND_TONE[signal.kind]} size="sm">
                        {SIGNAL_KIND_LABEL[signal.kind]}
                    </ToneBadge>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                        {signal.bellText}
                    </pre>
                </div>
            ))}
        </div>
    </div>
);
