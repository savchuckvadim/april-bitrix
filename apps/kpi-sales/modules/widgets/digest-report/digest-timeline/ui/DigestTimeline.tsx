'use client';

import { MicroSegmented, SectionCard } from '@workspace/april-ui';
import { useDigestTimeline } from '../hooks/use-digest-timeline';
import { TIMELINE_VIEW_OPTIONS } from '../lib/timeline-series';
import { DigestTimelineSection } from './DigestTimelineSection';

/** «По часам»: события дня, план на день, звонки и эфир. */
export const DigestTimeline = () => {
    const timeline = useDigestTimeline();

    return (
        <SectionCard
            surface="glass"
            title="По часам"
            description={`Как приходили события, что было запланировано и как шли звонки — ${timeline.scopeLabel}`}
            actions={
                <MicroSegmented
                    ariaLabel="Вид почасовых данных"
                    options={[...TIMELINE_VIEW_OPTIONS]}
                    value={timeline.view}
                    onChange={timeline.setView}
                    size="xs"
                />
            }
        >
            <div className="grid gap-6 xl:grid-cols-2">
                <DigestTimelineSection
                    title={`События дня (${timeline.eventsCount})`}
                    hint="Час записи события, стек — исход"
                    buckets={timeline.events}
                    series={timeline.series.events}
                    view={timeline.view}
                    emptyText="Событий за день нет"
                />
                <DigestTimelineSection
                    title={`План на день (${timeline.plannedCount})`}
                    hint="Час дедлайна планов, поставленных на этот день заранее"
                    buckets={timeline.plan}
                    series={timeline.series.plan}
                    view={timeline.view}
                    emptyText="На этот день ничего не было запланировано заранее"
                />
                <div className="xl:col-span-2">
                    <DigestTimelineSection
                        title="Звонки и эфир"
                        hint="Фактические звонки по телефонии: количество и минуты эфира по часам"
                        buckets={timeline.calls}
                        series={timeline.series.calls}
                        view={timeline.view}
                        stacked={false}
                        emptyText={
                            timeline.hasCalls
                                ? 'Звонков за день нет'
                                : 'Статистика телефонии недоступна'
                        }
                    />
                </div>
            </div>
        </SectionCard>
    );
};
