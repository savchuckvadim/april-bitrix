'use client';

import * as React from 'react';
import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { portalSpendPath } from '../consts/spend.consts';
import { useTranscriptionSpendSummary } from '../lib/hooks/use-transcription-spend';
import { currentMoscowMonth, minutesLabel, rubLabel } from '../lib/spend-format';
import { SpendMonthSwitcher } from './SpendMonthSwitcher';
import { SpendTotalsTiles } from './SpendTotalsTiles';

const TH = 'py-1 text-left text-xs font-normal text-muted-foreground';
const TH_RIGHT = 'py-1 text-right text-xs font-normal text-muted-foreground';

/** Расход на распознавание по всем порталам за месяц: кто сколько съел. */
export const SpendSummaryView = () => {
    const [month, setMonth] = React.useState(() => currentMoscowMonth());
    const summary = useTranscriptionSpendSummary(month);
    const data = summary.data;

    return (
        <div className="space-y-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">Расход на распознавание</h1>
                <SpendMonthSwitcher month={month} onChange={setMonth} loading={summary.isFetching} />
            </div>

            {summary.isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {summary.isError && (
                <p className="text-sm text-destructive">Расход не загрузился: {summary.error.message}</p>
            )}

            {data && (
                <>
                    <SpendTotalsTiles month={data.month} totals={data.totals} />
                    <SectionCard
                        title="По порталам"
                        description={`Сначала самые дорогие. Цена минуты Яндекса — ${data.kopecksPerMinute} коп., меняется в «Настройках приложения».`}
                    >
                        {data.portals.length === 0 ? (
                            <p className="text-sm text-muted-foreground">За этот месяц звонки не распознавались.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className={TH}>Портал</th>
                                        <th className={TH_RIGHT}>Яндекс, рублей</th>
                                        <th className={TH_RIGHT}>Минут в Яндексе</th>
                                        <th className={TH_RIGHT}>Звонков в Яндексе</th>
                                        <th className={TH_RIGHT}>Всего звонков</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.portals.map(portal => (
                                        <tr key={portal.domain} className="border-t">
                                            <td className="py-1">
                                                {portal.portalId ? (
                                                    <Link
                                                        className="text-primary hover:underline"
                                                        href={portalSpendPath(portal.portalId)}
                                                    >
                                                        {portal.domain}
                                                    </Link>
                                                ) : (
                                                    portal.domain || 'Без портала'
                                                )}
                                            </td>
                                            <td className="text-right font-medium">{rubLabel(portal.totals.rub)}</td>
                                            <td className="text-right">{minutesLabel(portal.totals.yandexMinutes)}</td>
                                            <td className="text-right">{portal.totals.yandexCalls.toLocaleString('ru-RU')}</td>
                                            <td className="text-right text-muted-foreground">
                                                {portal.totals.calls.toLocaleString('ru-RU')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </SectionCard>
                </>
            )}
        </div>
    );
};
