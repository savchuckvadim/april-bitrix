import type { RTableProps } from '@workspace/april-ui';
import type { AirtimeUserRow } from '../model';
import { secondsToMinutes } from './airtime-format.util';

/**
 * Таблица эфирного времени → RTableProps (для CSV-экспорта числовые
 * значения: длительности в минутах). Рендер-таблица форматирует сама.
 */
export const getAirtimeCsvData = (rows: AirtimeUserRow[]): RTableProps => ({
    code: 'airtime',
    firstCellName: 'Менеджер',
    data: [
        ...rows.map(row => ({
            id: Number(row.user.ID),
            name: row.userName,
            actions: [
                { name: 'Звонков', value: row.callsCount },
                { name: 'Эфир, мин', value: secondsToMinutes(row.airtimeSeconds) },
                { name: 'Входящих', value: row.incoming.count },
                {
                    name: 'Входящие, мин',
                    value: secondsToMinutes(row.incoming.seconds),
                },
                { name: 'Исходящих', value: row.outgoing.count },
                {
                    name: 'Исходящие, мин',
                    value: secondsToMinutes(row.outgoing.seconds),
                },
            ],
        })),
        {
            name: 'Итого',
            actions: [
                {
                    name: 'Звонков',
                    value: rows.reduce((sum, row) => sum + row.callsCount, 0),
                },
                {
                    name: 'Эфир, мин',
                    value: secondsToMinutes(
                        rows.reduce((s, row) => s + row.airtimeSeconds, 0),
                    ),
                },
                {
                    name: 'Входящих',
                    value: rows.reduce((s, row) => s + row.incoming.count, 0),
                },
                {
                    name: 'Входящие, мин',
                    value: secondsToMinutes(
                        rows.reduce((s, row) => s + row.incoming.seconds, 0),
                    ),
                },
                {
                    name: 'Исходящих',
                    value: rows.reduce((s, row) => s + row.outgoing.count, 0),
                },
                {
                    name: 'Исходящие, мин',
                    value: secondsToMinutes(
                        rows.reduce((s, row) => s + row.outgoing.seconds, 0),
                    ),
                },
            ],
        },
    ],
});
