'use client';

import * as React from 'react';
import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { usePortalTranscriptionSpend } from '../lib/hooks/use-transcription-spend';
import { currentMoscowMonth } from '../lib/spend-format';
import { SpendMonthSwitcher } from './SpendMonthSwitcher';
import { SpendTotalsTiles } from './SpendTotalsTiles';
import {
    SpendDaysTable,
    SpendProvidersTable,
    SpendTopCallsTable,
    SpendUsersTable,
} from './SpendTables';

interface PortalSpendViewProps {
    portalId: number;
    domain: string;
}

/**
 * Расход портала на распознавание за месяц: итог и сравнение с прошлым,
 * распознаватели, дни, сотрудники, самые длинные звонки Яндекса и что
 * сделать, чтобы платить меньше.
 */
export const PortalSpendView = ({ portalId, domain }: PortalSpendViewProps) => {
    const [month, setMonth] = React.useState(() => currentMoscowMonth());
    const spend = usePortalTranscriptionSpend(domain, month);
    const data = spend.data;

    return (
        <div className="space-y-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">
                    Расход на распознавание
                    <span className="ml-2 text-lg text-muted-foreground">({domain})</span>
                </h1>
                <SpendMonthSwitcher month={month} onChange={setMonth} loading={spend.isFetching} />
            </div>

            {spend.isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {spend.isError && (
                <p className="text-sm text-destructive">Расход не загрузился: {spend.error.message}</p>
            )}

            {data && (
                <>
                    <SpendTotalsTiles month={data.month} totals={data.totals} previous={data.previousTotals} />

                    {data.totals.calls === 0 && (
                        <p className="text-sm text-muted-foreground">За этот месяц звонки портала не распознавались.</p>
                    )}

                    {data.totals.unknownDurationCalls > 0 && (
                        <p className="text-sm text-muted-foreground">
                            У {data.totals.unknownDurationCalls.toLocaleString('ru-RU')} звонков нет длительности —
                            в минуты и рубли они не попали, расход немного занижен.
                        </p>
                    )}

                    <div className="grid gap-4 lg:grid-cols-2">
                        <SectionCard
                            title="Кто распознавал"
                            description={`Цена минуты Яндекса — ${data.kopecksPerMinute} коп.; звонок короче 15 секунд Яндекс считает как 15 секунд.`}
                        >
                            {data.providers.length > 0 ? (
                                <SpendProvidersTable providers={data.providers} />
                            ) : (
                                <p className="text-sm text-muted-foreground">Нет распознанных звонков.</p>
                            )}
                            <p className="mt-3 text-xs text-muted-foreground">
                                Цена меняется в <Link className="text-primary hover:underline" href="/settings">«Настройках приложения»</Link>,
                                группа «Разборы звонков». Попытки, когда Яндекс сорвался и звонок распознал запасной,
                                здесь не видны, хотя Яндекс мог их посчитать.
                            </p>
                        </SectionCard>

                        <SectionCard
                            title="Как платить меньше"
                            description="В карточке «Кто распознаёт звонки» настроек AI портала."
                        >
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                                <li>Поднимите «Длинный звонок — от, секунд»: в Яндекс уйдут только звонки длиннее.</li>
                                <li>В «Запасных» включите свой список без Яндекса — короткие звонки не будут уходить в Яндекс, когда сорвался VibeCode.</li>
                                <li>Если портал тестовый — поставьте VibeCode и на длинные звонки.</li>
                            </ul>
                            <Link
                                className="mt-3 inline-block text-sm text-primary hover:underline"
                                href={`/portal/${portalId}/ai-settings`}
                            >
                                Открыть настройки AI портала →
                            </Link>
                        </SectionCard>
                    </div>

                    {data.days.length > 0 && (
                        <SectionCard title="По дням" description="Дни — по Москве, дни без звонков не показаны.">
                            <SpendDaysTable days={data.days} />
                        </SectionCard>
                    )}

                    {data.users.length > 0 && (
                        <SectionCard title="По сотрудникам" description="Сначала те, чьи звонки обошлись дороже.">
                            <SpendUsersTable users={data.users} />
                        </SectionCard>
                    )}

                    {data.topCalls.length > 0 && (
                        <SectionCard
                            title="Самые длинные звонки в Яндексе"
                            description="Нажмите на дату, чтобы открыть текст разговора."
                        >
                            <SpendTopCallsTable calls={data.topCalls} portalId={portalId} />
                        </SectionCard>
                    )}
                </>
            )}
        </div>
    );
};
