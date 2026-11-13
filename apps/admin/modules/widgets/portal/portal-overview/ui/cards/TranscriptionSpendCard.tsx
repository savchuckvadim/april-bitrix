'use client';

import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import {
    changeLabel,
    minutesLabel,
    monthLabel,
    portalSpendPath,
    previousMonthDative,
    rubLabel,
    usePortalTranscriptionSpend,
} from '@/modules/entities/transcription-spend';

/**
 * Распознавание звонков портала за текущий месяц: сколько стоил Яндекс,
 * сколько звонков ушло бесплатным распознавателям и как это к прошлому
 * месяцу. Подробности — на странице расхода портала.
 */
export const TranscriptionSpendCard = ({ portalId, domain }: { portalId: number; domain: string }) => {
    const { data, isLoading, isError } = usePortalTranscriptionSpend(domain);
    const change = data ? changeLabel(data.totals.rub, data.previousTotals.rub) : null;
    const free = data ? data.totals.calls - data.totals.yandexCalls : 0;

    return (
        <SectionCard
            title={data ? `Распознавание звонков · ${monthLabel(data.month)}` : 'Распознавание звонков'}
            description="Платим только за Яндекс; VibeCode и свой Whisper — бесплатно."
            actions={
                data && data.totals.rub > 0 ? (
                    <ToneBadge tone="warning" size="sm">
                        {rubLabel(data.totals.rub)}
                    </ToneBadge>
                ) : undefined
            }
        >
            {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {isError && <p className="text-sm text-destructive">Расход не загрузился</p>}
            {data && data.totals.calls === 0 && (
                <p className="text-sm text-muted-foreground">В этом месяце звонки портала не распознавались.</p>
            )}
            {data && data.totals.calls > 0 && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Яндекс</dt>
                    <dd className="text-right">
                        {rubLabel(data.totals.rub)} · {minutesLabel(data.totals.yandexMinutes)} ·{' '}
                        {data.totals.yandexCalls.toLocaleString('ru-RU')} зв.
                    </dd>
                    <dt className="text-muted-foreground">Бесплатно</dt>
                    <dd className="text-right">{free.toLocaleString('ru-RU')} зв.</dd>
                    <dt className="text-muted-foreground">К прошлому месяцу</dt>
                    <dd className="text-right">
                        {change ? `${change} ${previousMonthDative(data.month)}` : 'не с чем сравнить'} · было{' '}
                        {rubLabel(data.previousTotals.rub)}
                    </dd>
                </dl>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <Link className="text-primary hover:underline" href={portalSpendPath(portalId)}>
                    Подробнее: дни, сотрудники, длинные звонки →
                </Link>
                <Link className="text-primary hover:underline" href={`/portal/${portalId}/ai-settings`}>
                    Кто распознаёт звонки →
                </Link>
            </div>
        </SectionCard>
    );
};
