import {
    formatDigestNumber,
    formatDigestPercent,
    type DigestMetricValues,
} from '@/modules/entities/digest';
import type { DigestTileData } from '../../lib/digest-tile';

export type SummaryTile = DigestTileData;

const n = formatDigestNumber;

/** Плитки итогов выборки из суммарных значений метрик. */
export const buildSummaryTiles = (values: DigestMetricValues): SummaryTile[] => {
    const workedParts = [
        `состоялось ${n(values.done)}`,
        `не состоялось ${n(values.notHeld)}`,
        `перенесено ${n(values.postponed)}`,
    ];

    const calls =
        values.callsCount === null
            ? '—'
            : `${n(values.callsCount)} · ${n(values.airtimeMinutes)} мин`;

    return [
        {
            key: 'plannedAtStart',
            label: 'Запланировано в CRM на день',
            value: n(values.plannedAtStart),
            sub:
                values.planResultRate === null
                    ? undefined
                    : `состоялось ${formatDigestPercent(values.planResultRate)} плана · отработано ${formatDigestPercent(values.planCompletion)}`,
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
            sub: 'состоялось / отработано',
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
