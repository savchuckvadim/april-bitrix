import type { Tone } from '@workspace/april-ui';
import type { DigestRecord, DigestRow } from '@/modules/entities/digest';

export interface FeedGroup {
    userId: number;
    name: string;
    records: DigestRecord[];
}

/** Группы ленты: сотрудник → события дня в хронологическом порядке. */
export const buildFeedGroups = (rows: readonly DigestRow[]): FeedGroup[] =>
    rows
        .map(row => ({
            userId: row.userId,
            name: row.name,
            records: [...row.employee.records].sort((a, b) =>
                (a.eventDate ?? '').localeCompare(b.eventDate ?? ''),
            ),
        }))
        .filter(group => group.records.length > 0);

/** Тон бэйджа действия. */
export const actionTone = (actionCode: string | null): Tone => {
    switch (actionCode) {
        case 'done':
            return 'success';
        case 'act_noresult_fail':
            return 'destructive';
        case 'pound':
            return 'warning';
        case 'plan':
            return 'info';
        case 'act_send':
            return 'primary';
        case 'expired':
        default:
            return 'muted';
    }
};

/** У плана/переноса есть следующий шаг — показываем дедлайн. */
export const isPlanRecord = (record: DigestRecord): boolean =>
    record.actionCode === 'plan' || record.actionCode === 'pound';

export const feedRecordsCount = (groups: readonly FeedGroup[]): number =>
    groups.reduce((sum, group) => sum + group.records.length, 0);
