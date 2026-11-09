'use client';

import { Download, RefreshCw, Send } from 'lucide-react';
import { HintTooltip, MicroSelect } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { AiOwnerReportState } from '../../hooks/use-ai-owner-report';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';

interface AiOwnerReportToolbarProps {
    report: AiOwnerReportState;
    canRebuild: boolean;
    /** Показывать «Отправить себе» (руководителю с правами настройки). */
    canSend: boolean;
}

const T = AI_OWNER_REPORT_TEXT;

/**
 * Вид периода, ключ периода, «Скачать PDF», «Отправить себе» (проверка
 * доставки) и «Собрать заново» (руководителю); итог отправки — строкой.
 */
export const AiOwnerReportToolbar = ({
    report,
    canRebuild,
    canSend,
}: AiOwnerReportToolbarProps) => {
    const loading = report.status === 'loading';
    const { send } = report;
    return (
        <div className="flex flex-wrap items-center gap-2">
            <MicroSelect
                ariaLabel={T.kindLabel}
                value={report.kind}
                options={report.kindOptions}
                onChange={report.changeKind}
                disabled={loading}
                className="min-w-28"
            />
            <MicroSelect
                ariaLabel={T.periodLabel}
                value={report.periodKey}
                options={report.periodOptions}
                onChange={report.changePeriod}
                disabled={loading}
                className="min-w-44"
            />
            {report.data && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    title={report.pdfError ?? T.pdf.title}
                    disabled={loading || report.pdfLoading}
                    onClick={() => void report.downloadPdf()}
                >
                    <Download
                        className={cn('h-3 w-3', report.pdfLoading && 'animate-pulse')}
                    />
                    {T.pdf.label}
                </Button>
            )}
            {canSend && report.data && (
                <HintTooltip title={T.send.title} lines={[...T.send.lines]}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={loading || send.loading}
                        onClick={() => void report.sendToSelf()}
                    >
                        <Send
                            className={cn('h-3 w-3', send.loading && 'animate-pulse')}
                        />
                        {T.send.label}
                    </Button>
                </HintTooltip>
            )}
            {canRebuild && (
                <HintTooltip title={T.rebuild.title} lines={[...T.rebuild.lines]}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={loading}
                        onClick={report.rebuild}
                    >
                        <RefreshCw
                            className={cn('h-3 w-3', loading && 'animate-spin')}
                        />
                        {T.rebuild.label}
                    </Button>
                </HintTooltip>
            )}
            {send.message && (
                <span
                    className={cn(
                        'basis-full text-xs',
                        send.failed ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {send.message}
                    {send.fileUrl && (
                        <>
                            {' '}
                            <a
                                href={send.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                            >
                                {T.send.openPdf}
                            </a>
                        </>
                    )}
                </span>
            )}
        </div>
    );
};
