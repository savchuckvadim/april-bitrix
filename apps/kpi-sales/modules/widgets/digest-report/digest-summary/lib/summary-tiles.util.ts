import {
    formatDigestNumber,
    formatDigestPercent,
    type DigestMetricValues,
} from '@/modules/entities/digest';

export interface SummaryTile {
    key: string;
    label: string;
    value: string;
    sub?: string;
    /** Токен-класс акцента подписи (text-success и т.п.). */
    accent: string;
}

const n = formatDigestNumber;

/** Плитки итогов выборки из суммарных значений метрик. */
export const buildSummaryTiles = (values: DigestMetricValues): SummaryTile[] => {
    const workedParts = [
        `результативно ${n(values.done)}`,
        `не состоялось ${n(values.notHeld)}`,
        `перенесено ${n(values.postponed)}`,
    ];
    if ((values.expired ?? 0) > 0) workedParts.push(`просрочено ${n(values.expired)}`);

    const calls =
        values.callsCount === null
            ? '—'
            : `${n(values.callsCount)} · ${n(values.airtimeMinutes)} мин`;

    return [
        {
            key: 'plannedAtStart',
            label: 'Запланировано на начало дня',
            value: n(values.plannedAtStart),
            sub:
                values.planCompletion === null
                    ? undefined
                    : `отработано ${formatDigestPercent(values.planCompletion)} плана`,
            accent: 'text-info',
        },
        {
            key: 'worked',
            label: 'Отработано',
            value: n(values.worked),
            sub: workedParts.join(' · '),
            accent: 'text-foreground',
        },
        {
            key: 'resultRate',
            label: 'Результативность',
            value: formatDigestPercent(values.resultRate),
            sub: 'результативно / отработано',
            accent: 'text-success',
        },
        {
            key: 'plannedBeyond',
            label: 'Запланировано на будущее',
            value: n(values.plannedBeyond),
            sub: `новых планов за день ${n(values.planned)}`,
            accent: 'text-info',
        },
        {
            key: 'outcomes',
            label: 'Продажи / отказы',
            value: `${n(values.sales)} / ${n(values.refusals)}`,
            sub:
                (values.documents ?? 0) > 0
                    ? `документов отправлено ${n(values.documents)}`
                    : undefined,
            accent: 'text-success',
        },
        {
            key: 'calls',
            label: 'Звонки факт · эфир',
            value: calls,
            sub: values.callsCount === null ? 'телефония недоступна' : 'по voximplant',
            accent: 'text-primary',
        },
    ];
};
