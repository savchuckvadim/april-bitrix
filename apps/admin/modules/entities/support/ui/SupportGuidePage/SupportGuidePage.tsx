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
import { SUPPORT_TEXT } from '../../consts/support.const';
import { useSupportGuide } from '../../lib/hooks/use-support';
import { SupportChecklist } from '../components/SupportChecklist';
import { SupportLink } from '../components/SupportLink';
import { SupportPreviewCard } from '../components/SupportPreviewCard';

/**
 * Раздел «Поддержка клиентов»: суть, чек-лист «что осталось, чтобы
 * заработало», кнопка «Проверить линию сейчас», разделы путеводителя
 * (концепция, как пользоваться, алгоритм, ключи, что не сделано) и
 * смежные ссылки. Тексты и чек-лист — с бэка admin.
 */
export const SupportGuidePage = () => {
    const guide = useSupportGuide();
    const [tab, setTab] = useState<string>('');

    if (guide.isLoading) {
        return <p className="text-sm text-muted-foreground">{SUPPORT_TEXT.loading}</p>;
    }
    if (guide.isError || !guide.data) {
        return (
            <HookNotice
                tone="error"
                title={SUPPORT_TEXT.loadError}
                message={getApiErrorMessage(guide.error)}
            />
        );
    }

    const data = guide.data;
    const activeTab = tab || data.sections[0]?.key || '';

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{SUPPORT_TEXT.title}</h1>
                <p className="text-sm text-muted-foreground">
                    {SUPPORT_TEXT.lineLabel} {data.lineDomain}
                </p>
                <p className="text-sm">{data.summary}</p>
            </div>

            <SupportChecklist checks={data.checklist} />
            <SupportPreviewCard domain={data.lineDomain} />

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

            <SectionCard title={SUPPORT_TEXT.linksTitle}>
                <ul className="space-y-1">
                    {data.links.map(link => (
                        <li key={link.href}>
                            <SupportLink link={link} />
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
};
