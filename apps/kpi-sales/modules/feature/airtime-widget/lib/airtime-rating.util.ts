import type { RatingDataset } from '@/modules/feature/report-rating';
import type { AirtimeUserRow } from '@/modules/entities/airtime';
import { secondsToMinutes } from '@/modules/entities/airtime';

/** Коды показателей рейтинга эфирного времени. */
export const AIRTIME_RATING_CODES = {
    total: 'airtime_total_min',
    incoming: 'airtime_incoming_min',
    outgoing: 'airtime_outgoing_min',
    calls: 'airtime_calls',
} as const;

/** Датасет для EntityRatingChart: длительности в минутах. */
export const buildAirtimeRatingDataset = (
    rows: AirtimeUserRow[],
): RatingDataset => ({
    actions: [
        { code: AIRTIME_RATING_CODES.total, name: 'Эфир всего, мин' },
        { code: AIRTIME_RATING_CODES.incoming, name: 'Входящие, мин' },
        { code: AIRTIME_RATING_CODES.outgoing, name: 'Исходящие, мин' },
        { code: AIRTIME_RATING_CODES.calls, name: 'Звонков' },
    ],
    rows: rows.map(row => ({
        userId: Number(row.user.ID),
        name: row.userName,
        values: {
            [AIRTIME_RATING_CODES.total]: secondsToMinutes(row.airtimeSeconds),
            [AIRTIME_RATING_CODES.incoming]: secondsToMinutes(
                row.incoming.seconds,
            ),
            [AIRTIME_RATING_CODES.outgoing]: secondsToMinutes(
                row.outgoing.seconds,
            ),
            [AIRTIME_RATING_CODES.calls]: row.callsCount,
        },
    })),
});
