'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Spinner } from '@workspace/april-ui/feedback';
import { AUDIT_TEXT } from '../../consts/ai-analytics-audit.const';
import type { AiAnalyticsAuditAbout } from '../../model';
import { AboutTextBlock } from './components/AboutTextBlock';
import { AboutTextList } from './components/AboutTextList';
import { AuditComputesTable } from './components/AuditComputesTable';
import { AuditSectionsList } from './components/AuditSectionsList';

interface AuditAboutCardProps {
    about: AiAnalyticsAuditAbout | null;
    isLoading: boolean;
    isError: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * «Что делает аудит и как читать результат» — самоописание с бэка
 * (тот же текст, что в Swagger и README). Показывается всегда, в том
 * числе до запуска; сворачивается, когда появляется результат.
 */
export const AuditAboutCard = ({
    about,
    isLoading,
    isError,
    open,
    onOpenChange,
}: AuditAboutCardProps) => (
    <SectionCard
        title={about?.title ?? AUDIT_TEXT.aboutTitle}
        description={about ? AUDIT_TEXT.aboutTitle : undefined}
        collapsible
        open={open}
        onOpenChange={onOpenChange}
        state={isError ? 'error' : 'default'}
        message={isError ? AUDIT_TEXT.aboutLoadError : undefined}
        contentClassName="space-y-5"
    >
        {isLoading && !about && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner size="sm" />
                Загрузка…
            </div>
        )}

        {about && (
            <>
                <p className="text-sm">{about.purpose}</p>
                <div className="grid gap-5 md:grid-cols-2">
                    <AboutTextList
                        title={AUDIT_TEXT.aboutSources}
                        items={about.sources}
                    />
                    <AboutTextList
                        title={AUDIT_TEXT.aboutNotDoing}
                        items={about.notDoing}
                    />
                </div>
                <AuditComputesTable items={about.computes} />
                <AuditSectionsList sections={about.resultSections} />
                <AboutTextBlock
                    title={AUDIT_TEXT.aboutRecommendationRule}
                    text={about.recommendationRule}
                />
                <div className="grid gap-5 md:grid-cols-2">
                    <AboutTextBlock
                        title={AUDIT_TEXT.aboutStorage}
                        text={about.storage}
                    />
                    <AboutTextBlock
                        title={AUDIT_TEXT.aboutAccess}
                        text={about.access}
                    />
                </div>
                <AboutTextList
                    title={AUDIT_TEXT.aboutHowToRun}
                    items={about.howToRun}
                />
            </>
        )}
    </SectionCard>
);
