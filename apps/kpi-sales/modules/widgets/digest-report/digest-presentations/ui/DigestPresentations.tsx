'use client';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { SectionCard } from '@workspace/april-ui';
import { DigestRecordRow } from '../../digest-feed';
import { useDigestPresentations } from '../hooks/use-digest-presentations';
import { PRESENTATION_TABS } from '../lib/digest-presentations.util';

/** Презентации одного сотрудника: проведено / не проведено / план на день / новые планы. */
export const DigestPresentations = () => {
    const presentations = useDigestPresentations();
    if (!presentations) return null;

    return (
        <SectionCard
            surface="glass"
            title={`Презентации — ${presentations.name}`}
            description="Проведённые и несостоявшиеся презентации дня с комментариями, запланированные на день и новые планы"
        >
            <Tabs defaultValue={presentations.slices.held.length ? 'held' : 'plannedAtStart'}>
                <TabsList>
                    {PRESENTATION_TABS.map(tab => (
                        <TabsTrigger key={tab.key} value={tab.key}>
                            {tab.label} ({presentations.slices[tab.key].length})
                        </TabsTrigger>
                    ))}
                </TabsList>
                {PRESENTATION_TABS.map(tab => (
                    <TabsContent key={tab.key} value={tab.key}>
                        {!presentations.slices[tab.key].length ? (
                            <p className="py-3 text-sm text-muted-foreground">Нет записей</p>
                        ) : (
                            <ul>
                                {presentations.slices[tab.key].map(record => (
                                    <DigestRecordRow
                                        key={record.id}
                                        record={record}
                                        names={presentations.names}
                                        domain={presentations.domain}
                                        listId={presentations.listId}
                                        timeFrom={
                                            tab.key === 'plannedAtStart' ? 'planDate' : 'eventDate'
                                        }
                                    />
                                ))}
                            </ul>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </SectionCard>
    );
};
