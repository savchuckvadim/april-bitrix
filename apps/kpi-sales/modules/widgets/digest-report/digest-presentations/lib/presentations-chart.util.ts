/**
 * Данные графиков презентаций: часы (стек по статусам) с тултипом «кто и
 * что писали», комплекты (количество и сумма). Цвета — токены темы.
 */
import {
    hourLabel,
    presentationClientTitle,
    PRES_STATUS_LABELS,
    PRES_STATUS_ORDER,
    PRES_STATUS_TOKENS,
    timeOfDateTime,
    type ComplectStat,
    type DigestPresentation,
    type HourBucket,
    type HourRange,
} from '@/modules/entities/digest';
import { resolveDigestToken, withAlpha } from '../../lib/digest-chart-colors';

const TOOLTIP_ITEMS_LIMIT = 6;
const TOOLTIP_COMMENT_LIMIT = 90;

const clip = (text: string, limit: number): string =>
    text.length > limit ? `${text.slice(0, limit)}…` : text;

export const presHourlyChartData = (
    buckets: readonly HourBucket[],
    range: HourRange,
) => {
    const inRange = buckets.filter(bucket => bucket.hour >= range.from && bucket.hour <= range.to);
    const statuses = PRES_STATUS_ORDER.filter(status =>
        inRange.some(bucket => (bucket.values[status] ?? 0) > 0),
    );
    return {
        hours: inRange.map(bucket => bucket.hour),
        labels: inRange.map(bucket => hourLabel(bucket.hour)),
        datasets: statuses.map(status => {
            const color = resolveDigestToken(PRES_STATUS_TOKENS[status]);
            return {
                label: PRES_STATUS_LABELS[status],
                data: inRange.map(bucket => bucket.values[status] ?? 0),
                backgroundColor: withAlpha(color, 0.75),
                borderColor: color,
                borderWidth: 1,
                borderRadius: 3,
            };
        }),
    };
};

/** Строки тултипа часа: клиент · статус · сотрудник и комментарии. */
export const presTooltipLines = (
    items: readonly DigestPresentation[],
    nameOf: (userId: number) => string,
): string[] => {
    const lines: string[] = [];
    for (const item of items.slice(0, TOOLTIP_ITEMS_LIMIT)) {
        lines.push(
            `• ${presentationClientTitle(item)} — ${PRES_STATUS_LABELS[item.dayStatus]} (${nameOf(item.assignedId)})`,
        );
        if (item.planComment) lines.push(`   план: ${clip(item.planComment, TOOLTIP_COMMENT_LIMIT)}`);
        if (item.reportComment) lines.push(`   итог: ${clip(item.reportComment, TOOLTIP_COMMENT_LIMIT)}`);
    }
    if (items.length > TOOLTIP_ITEMS_LIMIT) {
        lines.push(`…и ещё ${items.length - TOOLTIP_ITEMS_LIMIT}`);
    }
    return lines;
};

export const complectChartData = (stats: readonly ComplectStat[]) => {
    const color = resolveDigestToken('--digest-documents');
    return {
        labels: stats.map(stat => stat.name),
        datasets: [
            {
                label: 'Проведено презентаций',
                data: stats.map(stat => stat.count),
                backgroundColor: withAlpha(color, 0.75),
                borderColor: color,
                borderWidth: 1,
                borderRadius: 3,
            },
        ],
    };
};

/** Тон бэйджа статуса презентации (реестр тонов april-ui). */
export const presStatusTone = (
    status: DigestPresentation['dayStatus'],
): 'success' | 'destructive' | 'warning' | 'info' | 'primary' | 'muted' => {
    switch (status) {
        case 'held':
            return 'success';
        case 'notHeld':
        case 'refused':
            return 'destructive';
        case 'postponed':
            return 'warning';
        case 'pending':
            return 'info';
        case 'plannedNext':
            return 'primary';
        default:
            return 'muted';
    }
};

/** Время строки истории: для ждущих — назначенное, иначе — событие. */
export const presRowTime = (item: DigestPresentation): string => {
    const source =
        item.dayStatus === 'held'
            ? item.doneDate ?? item.movedAt
            : item.dayStatus === 'pending'
              ? item.planDate
              : item.dayStatus === 'plannedNext'
                ? item.planCreatedAt ?? item.createdAt
                : item.movedAt;
    return timeOfDateTime(source);
};
