'use client';

import { SectionCard } from '@workspace/april-ui';
import { formatAiDossierReason } from '@/modules/entities/ai-analytics';
import {
    AiDossierSeries,
    AiDossierToolbar,
    AiDossierTrends,
    AiDossierYoy,
    AiHowWeCountButton,
    AiQueuedState,
    AiTheoryLink,
} from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeProfile } from '../../hooks/use-ai-employee-profile';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';
import { AiEmployeeProfileChart } from '../components/AiEmployeeProfileChart';

const T = AI_EMPLOYEE_TEXT.quality;
const MUTED = 'py-2 text-xs text-muted-foreground';

/** Причина пустого раздела досье словами; раздел есть или причины нет — null. */
const dossierReason = (
    reasons: { section: string; reason: string; text: string }[] | undefined,
    section: string,
): string | null => {
    const reason = reasons?.find(item => item.section === section);
    return reason ? formatAiDossierReason(reason) : null;
};

/**
 * Подвкладка «Качество»: ряды недель и месяцев из досье (окно 3/6/12
 * мес., «Пересобрать»), профиль по корзинам или типам и по разделам
 * разговора рядом со средним по отделу (матрицы вкладки AI), тренды
 * словами и «год назад». Пустые разделы — с причиной бэка.
 */
export const AiEmployeeQualityTab = () => {
    const { managerId, dossier, trends, yoy } = useAiEmployeeContext();
    const profile = useAiEmployeeProfile(managerId);
    const data = dossier.data;

    return (
        <>
            <SectionCard
                surface="glass"
                title={T.series.title}
                description={T.series.description}
                actions={
                    <>
                        <AiTheoryLink topic="dossier" variant="icon" />
                        <AiHowWeCountButton endpoint="dossier" />
                    </>
                }
            >
                <div className="space-y-3">
                    <AiDossierToolbar
                        months={dossier.months}
                        onMonths={dossier.setMonths}
                        loading={dossier.status === 'loading'}
                        onRebuild={dossier.rebuild}
                        data={data}
                    />
                    <AiQueuedState
                        status={dossier.status}
                        jobStatus={dossier.jobStatus}
                        error={dossier.error}
                        loadingText={T.series.loading}
                        skeletonRows={3}
                        onRetry={dossier.rebuild}
                    />
                    {data?.series && <AiDossierSeries series={data.series} />}
                    {data && !data.series && (
                        <p className={MUTED}>{dossierReason(data.reasons, 'series')}</p>
                    )}
                </div>
            </SectionCard>

            <AiQueuedState
                status={profile.section.status}
                jobStatus={profile.section.jobStatus}
                error={profile.section.error}
                loadingText={T.profile.loading}
                skeletonRows={2}
                onRetry={profile.section.retry}
            />
            {profile.isReady && (
                <>
                    <AiEmployeeProfileChart profile={profile.types} />
                    <AiEmployeeProfileChart profile={profile.sections} />
                </>
            )}

            <SectionCard surface="glass" title={T.trends.title} actions={<AiTheoryLink topic="trends" variant="icon" />}>
                {trends ? (
                    <AiDossierTrends trends={trends} />
                ) : (
                    <p className={MUTED}>{dossierReason(data?.reasons, 'trends') ?? T.trends.empty}</p>
                )}
            </SectionCard>

            <SectionCard surface="glass" title={T.yoy.title} actions={<AiTheoryLink topic="yearAgo" variant="icon" />}>
                {yoy ? (
                    <AiDossierYoy yoy={yoy} />
                ) : (
                    <p className={MUTED}>{dossierReason(data?.reasons, 'yoy') ?? T.yoy.empty}</p>
                )}
            </SectionCard>
        </>
    );
};
