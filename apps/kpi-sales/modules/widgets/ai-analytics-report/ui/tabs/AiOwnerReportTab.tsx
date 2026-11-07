'use client';

import { SectionCard } from '@workspace/april-ui';
import { AI_QUEUED_ERROR_MESSAGES } from '@/modules/entities/ai-analytics';
import { useAiOwnerReport } from '../../hooks/use-ai-owner-report';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';
import { AiQueuedState } from '../components/AiQueuedState';
import { AiOwnerReportBody } from '../owner-report/AiOwnerReportBody';
import { AiOwnerReportToolbar } from '../owner-report/AiOwnerReportToolbar';

interface AiOwnerReportTabProps {
    canConfigure: boolean;
}

const T = AI_OWNER_REPORT_TEXT;

const loadingText = (jobStatus: string | null): string =>
    jobStatus === 'queued'
        ? T.loading.queued
        : jobStatus === 'processing'
          ? T.loading.processing
          : T.loading.default;

/**
 * Подвкладка «Отчёт за период»: выбор вида и ключа периода, состояние
 * очереди, затем отчёт по разделам в порядке подачи собственнику. Текст
 * приходит с сервера готовым — компоненты только раскладывают.
 */
export const AiOwnerReportTab = ({ canConfigure }: AiOwnerReportTabProps) => {
    const report = useAiOwnerReport();

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            actions={
                <AiOwnerReportToolbar
                    report={report}
                    canRebuild={canConfigure && report.isLeader}
                />
            }
        >
            {!report.isLeader ? (
                <p className="py-2 text-xs text-muted-foreground">{T.noScope}</p>
            ) : (
                <>
                    <AiQueuedState
                        status={report.status}
                        jobStatus={report.jobStatus}
                        error={report.error}
                        loadingText={loadingText(report.jobStatus)}
                        skeletonRows={6}
                        errorFallback={AI_QUEUED_ERROR_MESSAGES.ownerReport}
                        onRetry={report.retry}
                    />
                    {report.data && <AiOwnerReportBody report={report.data} />}
                </>
            )}
        </SectionCard>
    );
};
