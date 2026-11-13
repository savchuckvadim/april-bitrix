import Link from 'next/link';
import type {
    TranscriptionSpendCallDto,
    TranscriptionSpendDayDto,
    TranscriptionSpendProviderDto,
    TranscriptionSpendUserDto,
} from '@workspace/nest-admin-api';
import { portalTranscriptionPath } from '../consts/spend.consts';
import { dayLabel, minutesLabel, rubLabel } from '../lib/spend-format';

const TH = 'py-1 text-left text-xs font-normal text-muted-foreground';
const TH_RIGHT = 'py-1 text-right text-xs font-normal text-muted-foreground';
const num = (value: number): string => value.toLocaleString('ru-RU');

/** Полоса доли от максимума — видно, какой день или сотрудник дороже. */
const Bar = ({ value, max }: { value: number; max: number }) => (
    <div className="h-1.5 w-full rounded bg-muted">
        <div
            className="h-1.5 rounded bg-amber-500"
            style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }}
        />
    </div>
);

/** Расход по распознавателям. */
export const SpendProvidersTable = ({ providers }: { providers: TranscriptionSpendProviderDto[] }) => (
    <table className="w-full text-sm">
        <thead>
            <tr>
                <th className={TH}>Распознаватель</th>
                <th className={TH_RIGHT}>Звонков</th>
                <th className={TH_RIGHT}>Минут</th>
                <th className={TH_RIGHT}>Рублей</th>
            </tr>
        </thead>
        <tbody>
            {providers.map(item => (
                <tr key={item.provider} className="border-t">
                    <td className="py-1">
                        {item.label}
                        {!item.paid && <span className="ml-2 text-xs text-muted-foreground">бесплатно</span>}
                    </td>
                    <td className="text-right">{num(item.calls)}</td>
                    <td className="text-right">{minutesLabel(item.minutes)}</td>
                    <td className="text-right">{item.paid ? rubLabel(item.rub) : '—'}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

/** Расход по дням месяца. */
export const SpendDaysTable = ({ days }: { days: TranscriptionSpendDayDto[] }) => {
    const max = Math.max(0, ...days.map(day => day.totals.rub));
    return (
        <table className="w-full text-sm">
            <thead>
                <tr>
                    <th className={TH}>День</th>
                    <th className={TH_RIGHT}>Звонков</th>
                    <th className={TH_RIGHT}>Минут в Яндексе</th>
                    <th className={TH_RIGHT}>Рублей</th>
                    <th className="w-1/4" />
                </tr>
            </thead>
            <tbody>
                {days.map(day => (
                    <tr key={day.day} className="border-t">
                        <td className="py-1">{dayLabel(day.day)}</td>
                        <td className="text-right">{num(day.totals.calls)}</td>
                        <td className="text-right">{minutesLabel(day.totals.yandexMinutes)}</td>
                        <td className="text-right">{rubLabel(day.totals.rub)}</td>
                        <td className="pl-3"><Bar value={day.totals.rub} max={max} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

/** Расход по сотрудникам: сначала самые дорогие. */
export const SpendUsersTable = ({ users }: { users: TranscriptionSpendUserDto[] }) => {
    const max = Math.max(0, ...users.map(user => user.totals.rub));
    return (
        <table className="w-full text-sm">
            <thead>
                <tr>
                    <th className={TH}>Сотрудник</th>
                    <th className={TH_RIGHT}>Звонков</th>
                    <th className={TH_RIGHT}>Из них в Яндексе</th>
                    <th className={TH_RIGHT}>Рублей</th>
                    <th className="w-1/4" />
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.userId ?? 'none'} className="border-t">
                        <td className="py-1">{user.userName ?? user.userId ?? 'Без сотрудника'}</td>
                        <td className="text-right">{num(user.totals.calls)}</td>
                        <td className="text-right">{num(user.totals.yandexCalls)}</td>
                        <td className="text-right">{rubLabel(user.totals.rub)}</td>
                        <td className="pl-3"><Bar value={user.totals.rub} max={max} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const durationMinutes = (sec: number): string =>
    `${Math.floor(sec / 60)} мин ${String(Math.round(sec % 60)).padStart(2, '0')} с`;

/** Самые длинные звонки Яндекса — со ссылкой на текст разговора. */
export const SpendTopCallsTable = ({
    calls,
    portalId,
}: {
    calls: TranscriptionSpendCallDto[];
    portalId: number;
}) => (
    <table className="w-full text-sm">
        <thead>
            <tr>
                <th className={TH}>Когда</th>
                <th className={TH}>Сотрудник</th>
                <th className={TH}>Сделка / клиент</th>
                <th className={TH_RIGHT}>Длительность</th>
                <th className={TH_RIGHT}>Рублей</th>
            </tr>
        </thead>
        <tbody>
            {calls.map(call => (
                <tr key={call.id} className="border-t">
                    <td className="py-1">
                        <Link className="text-primary hover:underline" href={portalTranscriptionPath(portalId, call.id)}>
                            {call.createdAt ? new Date(call.createdAt).toLocaleString('ru-RU') : `№ ${call.id}`}
                        </Link>
                    </td>
                    <td>{call.userName ?? '—'}</td>
                    <td className="max-w-xs truncate" title={call.entityName ?? undefined}>
                        {call.entityName ?? (call.entityId ? `${call.entityType ?? ''} ${call.entityId}` : '—')}
                    </td>
                    <td className="text-right">{durationMinutes(call.durationSec)}</td>
                    <td className="text-right">{rubLabel(call.rub)}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
