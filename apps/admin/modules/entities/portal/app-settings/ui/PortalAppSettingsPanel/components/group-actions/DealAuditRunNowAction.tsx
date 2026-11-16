'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { DEAL_AUDIT_RUN_TEXT } from '../../../../consts/deal-audit-run.const';
import { useDealAuditRunNow } from '../../../../lib/hooks/use-deal-audit-run-now';

interface DealAuditRunNowActionProps {
    portalId: number;
}

/**
 * Кнопка «Сформировать и отправить» категории «Аудит сделок»: прогон
 * портала сейчас, вне расписания. Сам прогон идёт на сервере минуты;
 * здесь — подтверждение и ответ «поставлено / уже идёт» с предупреждениями
 * по настройкам.
 */
export const DealAuditRunNowAction = ({
    portalId,
}: DealAuditRunNowActionProps) => {
    const [confirming, setConfirming] = useState(false);
    const run = useDealAuditRunNow();

    return (
        <div className="space-y-2 rounded-md border border-dashed px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    size="sm"
                    disabled={run.isPending}
                    onClick={() => setConfirming(true)}
                >
                    {run.isPending
                        ? DEAL_AUDIT_RUN_TEXT.running
                        : DEAL_AUDIT_RUN_TEXT.button}
                </Button>
                <p className="text-xs text-muted-foreground">
                    {DEAL_AUDIT_RUN_TEXT.hint}
                </p>
            </div>
            {run.data && (
                <div className="space-y-1 text-xs">
                    <p
                        className={
                            run.data.queued
                                ? 'text-foreground'
                                : 'text-warning'
                        }
                    >
                        {run.data.message}
                    </p>
                    {run.data.notes.map(note => (
                        <p key={note} className="text-warning">
                            {note}
                        </p>
                    ))}
                </div>
            )}
            {run.isError && (
                <p className="text-xs text-destructive">
                    {DEAL_AUDIT_RUN_TEXT.error}:{' '}
                    {getApiErrorMessage(run.error)}
                </p>
            )}
            <ConfirmDialog
                open={confirming}
                onOpenChange={setConfirming}
                title={DEAL_AUDIT_RUN_TEXT.confirmTitle}
                description={DEAL_AUDIT_RUN_TEXT.confirmDescription}
                confirmLabel={DEAL_AUDIT_RUN_TEXT.confirmLabel}
                onConfirm={() => run.mutate(portalId)}
            />
        </div>
    );
};
