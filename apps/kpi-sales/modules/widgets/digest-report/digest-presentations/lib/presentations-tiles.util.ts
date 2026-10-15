import { formatDigestNumber, formatDigestPercent, type PresSummary } from '@/modules/entities/digest';
import type { DigestTileData } from '../../lib/digest-tile';

const n = formatDigestNumber;
const money = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;

/** Плитки презентаций дня: план руководителя → план CRM → факт, исходы, деньги. */
export const buildPresTiles = (
    summary: PresSummary,
    managerPlan: number | null,
    planExecution: number | null,
): DigestTileData[] => [
    {
        key: 'managerPlan',
        label: 'План руководителя на день',
        value: managerPlan === null ? '—' : n(managerPlan),
        sub:
            planExecution === null
                ? 'цель «Презентации» не задана'
                : `исполнено ${formatDigestPercent(planExecution)}`,
        accent: 'text-primary',
    },
    {
        key: 'plannedAtStart',
        label: 'Стояло в CRM на день',
        value: n(summary.plannedAtStart),
        sub:
            summary.planConversion === null
                ? undefined
                : `проведено из плана ${formatDigestPercent(summary.planConversion)}`,
        accent: 'text-info',
    },
    {
        key: 'held',
        label: 'Проведено',
        value: n(summary.held),
        sub: summary.spontaneous ? `спонтанных ${n(summary.spontaneous)}` : undefined,
        accent: 'text-success',
    },
    {
        key: 'notHeld',
        label: 'Не состоялось · перенос · отказ',
        value: `${n(summary.notHeld)} · ${n(summary.postponed)} · ${n(summary.refused)}`,
        sub: summary.pending ? `ещё ждут ${n(summary.pending)}` : undefined,
        accent: 'text-destructive',
    },
    {
        key: 'plannedNext',
        label: 'Запланировано на будущее',
        value: n(summary.plannedNext),
        accent: 'text-info',
    },
    {
        key: 'heldSum',
        label: 'Сумма по комплектам',
        value: money(summary.heldSum),
        sub: 'проведённые с комплектом',
        accent: 'text-success',
    },
];
