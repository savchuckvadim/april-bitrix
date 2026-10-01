'use client';

import { FC } from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { CLIENT_WORK_TEXT } from '../../lib/client-work-text';
import type { ClientWorkView } from '../../lib/hooks/use-client-work';

export interface ClientWorkJoinBarProps {
    view: ClientWorkView;
}

/**
 * Присоединение отмеченных к основной — только руководителю.
 *
 * Два шага: кнопка взводит подтверждение с описанием последствий, второй
 * клик запускает операцию. Ничего не удаляется, но присоединённые сделки
 * закрываются «Дублем» — поэтому без подтверждения нельзя. После успеха —
 * итог, ссылка на основную и «Обновить приложение».
 */
export const ClientWorkJoinBar: FC<ClientWorkJoinBarProps> = ({ view }) => {
    if (view.joinStatus === 'joining') {
        return (
            <div className="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-muted-foreground">
                <Spinner /> {CLIENT_WORK_TEXT.joining}
            </div>
        );
    }

    if (view.joinStatus === 'done' && view.summary) {
        const { summary } = view;
        return (
            <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {CLIENT_WORK_TEXT.joined(summary.joined, summary.mainDealId)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {CLIENT_WORK_TEXT.moved(
                        summary.tasksMoved,
                        summary.activitiesMoved,
                    )}
                </p>
                {summary.skippedIds.length > 0 && (
                    <p className="text-xs text-warning">
                        {CLIENT_WORK_TEXT.skipped(summary.skippedIds)}
                    </p>
                )}
                {summary.warnings.length > 0 && (
                    <p className="text-xs text-warning">
                        {summary.warnings.join('; ')}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    {view.mainDealUrl && (
                        <a
                            href={view.mainDealUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-2"
                        >
                            {CLIENT_WORK_TEXT.openMain}
                            <ExternalLink aria-hidden className="size-3.5" />
                        </a>
                    )}
                    <Button size="sm" variant="outline" onClick={view.reload}>
                        {CLIENT_WORK_TEXT.reload}
                    </Button>
                </div>
            </div>
        );
    }

    if (view.joinStatus === 'armed') {
        return (
            <div className="space-y-2 rounded-md border border-warning/50 bg-warning/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {CLIENT_WORK_TEXT.confirmTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                    {view.confirmText}
                </p>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={view.confirm}>
                        {CLIENT_WORK_TEXT.confirm}
                    </Button>
                    <Button size="sm" variant="outline" onClick={view.disarm}>
                        {CLIENT_WORK_TEXT.cancel}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            {view.joinStatus === 'error' && view.joinError && (
                <p className="text-xs text-destructive">{view.joinError}</p>
            )}
            <p className="text-xs text-muted-foreground">
                {CLIENT_WORK_TEXT.selectHint}
            </p>
            <Button
                size="sm"
                variant="secondary"
                disabled={!view.canSubmit}
                onClick={view.arm}
            >
                <Link2 aria-hidden className="size-3.5" />
                {CLIENT_WORK_TEXT.join(view.selectedCount)}
            </Button>
        </div>
    );
};
