'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { GuideChecklist, GuideLink } from '@/modules/shared/ui/guide';
import {
    CABINET_GUIDE_COUNTER_LABELS,
    CABINET_GUIDE_TEXT as TEXT,
} from '../../consts/cabinet-guide.const';
import { useCabinetGuide } from '../../lib/hooks/use-cabinet-guide';
import type { CabinetGuideCounters } from '../../model';
import { CabinetMailTest } from './CabinetMailTest';

function Counters({ counters }: { counters: CabinetGuideCounters | null }) {
    if (!counters) {
        return <p className="text-sm text-muted-foreground">{TEXT.countersMissing}</p>;
    }
    return (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CABINET_GUIDE_COUNTER_LABELS.map(([key, label]) => (
                <div key={key} className="rounded-md border p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-lg font-semibold">{counters[key]}</dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * Путеводитель «Кабинет клиента»: суть, живой чек-лист готовности,
 * счётчики подключений и разделы (как устроено, подключить портал,
 * доступы, пароли, Telegram, приложение, окружение, что не сделано).
 * Тексты и чек-лист — с бэка admin.
 */
export const CabinetGuidePage = () => {
    const guide = useCabinetGuide();
    const [tab, setTab] = useState<string>('');

    if (guide.isLoading) {
        return <p className="text-sm text-muted-foreground">{TEXT.loading}</p>;
    }
    if (guide.isError || !guide.data) {
        return (
            <HookNotice
                tone="error"
                title={TEXT.loadError}
                message={getApiErrorMessage(guide.error)}
            />
        );
    }

    const data = guide.data;
    const activeTab = tab || data.sections[0]?.key || '';

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{TEXT.title}</h1>
                <p className="text-sm">{data.summary}</p>
            </div>

            <GuideChecklist
                checks={data.checklist}
                title={TEXT.checklistTitle}
                description={TEXT.checklistDescription}
                summaryLabel={TEXT.checklistSummary}
            />

            <CabinetMailTest />

            <SectionCard title={TEXT.countersTitle}>
                <Counters counters={data.counters} />
            </SectionCard>

            <Tabs value={activeTab} onValueChange={setTab}>
                <TabsList className="h-auto flex-wrap">
                    {data.sections.map(section => (
                        <TabsTrigger key={section.key} value={section.key}>
                            {section.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {data.sections.map(section => (
                    <TabsContent key={section.key} value={section.key} className="mt-4">
                        <SectionCard>
                            <MarkdownView text={section.markdown} />
                        </SectionCard>
                    </TabsContent>
                ))}
            </Tabs>

            <SectionCard title={TEXT.linksTitle}>
                <ul className="space-y-1">
                    {data.links.map(link => (
                        <li key={link.href}>
                            <GuideLink link={link} />
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
};
