'use client';

import { useEffect, useMemo } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { usePortals } from '@/modules/entities/portal';
import { useLocationHash } from '@/modules/shared/lib';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { AiLaunchPanel } from '@/modules/entities/ai-analytics-launch';
import {
    GUIDE_LAUNCH_SECTION_CODE,
    GUIDE_TEXT,
} from '../../consts/ai-analytics-guide.const';
import { isGuideActionCode } from '../../lib/guide-actions';
import { findPortalById, resolveSectionCode } from '../../lib/guide-view';
import {
    useGuidePortalSelection,
    useGuideSection,
    useGuideSections,
} from '../../lib/hooks';
import { GuideNotice } from '../components/GuideNotice';
import { GuideEndpoints } from './components/GuideEndpoints';
import { GuideLaunch } from './components/GuideLaunch';
import { GuidePortalSelect } from './components/GuidePortalSelect';
import { GuideRelations } from './components/GuideRelations';
import { GuideToc } from './components/GuideToc';

/**
 * Путеводитель по AI-аналитике: слева оглавление с якорями, справа раздел —
 * теория (markdown), «Связано» (настройки, параметры, kind'ы, страницы),
 * ручки с формами «Запуск» и чек-лист запуска. Портал — в `?portalId=`,
 * раздел — в `#code`; оба переживают перезагрузку.
 */
export const AiAnalyticsGuidePage = () => {
    const sections = useGuideSections();
    const selection = useGuidePortalSelection();
    const portals = usePortals();
    const [hash, setHash] = useLocationHash();

    const items = useMemo(() => sections.data ?? [], [sections.data]);
    const activeCode = resolveSectionCode(hash, items);
    const section = useGuideSection(activeCode);
    const domain = findPortalById(portals.data, selection.portalId)?.domain;

    // Переход по оглавлению — к началу раздела; смена портала якорь не трогает.
    useEffect(() => {
        if (activeCode) window.scrollTo({ top: 0 });
    }, [activeCode]);

    const launchActions = useMemo(
        () =>
            new Set(
                (section.data?.launch ?? [])
                    .map(step => step.action)
                    .filter(isGuideActionCode),
            ),
        [section.data?.launch],
    );

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold">{GUIDE_TEXT.pageTitle}</h1>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    {GUIDE_TEXT.pageDescription}
                </p>
            </div>

            <GuidePortalSelect portalId={selection.portalId} onChange={selection.setPortalId} />

            {sections.isError && (
                <GuideNotice
                    tone="error"
                    title={GUIDE_TEXT.listLoadError}
                    message={getApiErrorMessage(sections.error)}
                />
            )}

            <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-4 lg:self-start">
                    {sections.isLoading ? (
                        <p className="text-sm text-muted-foreground">{GUIDE_TEXT.loading}</p>
                    ) : (
                        <GuideToc items={items} activeCode={activeCode} onSelect={setHash} />
                    )}
                </aside>

                <div className="min-w-0 space-y-4">
                    {section.isLoading && (
                        <p className="text-sm text-muted-foreground">{GUIDE_TEXT.loading}</p>
                    )}
                    {section.isError && (
                        <GuideNotice
                            tone="error"
                            title={GUIDE_TEXT.entryLoadError}
                            message={getApiErrorMessage(section.error)}
                        />
                    )}
                    {section.data && (
                        <>
                            <div id={section.data.code}>
                                <h2 className="text-2xl font-semibold">{section.data.title}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {section.data.summary}
                                </p>
                            </div>

                            <SectionCard title={GUIDE_TEXT.theoryTitle}>
                                <MarkdownView text={section.data.theory} />
                            </SectionCard>

                            {/* Запуск после выкладки: сначала большие кнопки по шагам. */}
                            {section.data.code === GUIDE_LAUNCH_SECTION_CODE && (
                                <AiLaunchPanel domain={domain} />
                            )}

                            {section.data.launch.length > 0 && (
                                <GuideLaunch
                                    steps={section.data.launch}
                                    endpoints={section.data.endpoints}
                                    domain={domain}
                                />
                            )}

                            <h3 className="text-lg font-semibold">{GUIDE_TEXT.relatedTitle}</h3>
                            <GuideRelations
                                section={section.data}
                                portalId={selection.portalId}
                                onSelectSection={setHash}
                            />

                            <GuideEndpoints
                                endpoints={section.data.endpoints}
                                domain={domain}
                                hideActions={launchActions}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
