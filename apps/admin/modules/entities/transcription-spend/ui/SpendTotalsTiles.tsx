import type { TranscriptionSpendTotalsDto } from '@workspace/nest-admin-api';
import { changeLabel, minutesLabel, previousMonthDative, rubLabel } from '../lib/spend-format';
import { SpendTile } from './SpendTile';

interface SpendTotalsTilesProps {
    month: string;
    totals: TranscriptionSpendTotalsDto;
    /** Итог прошлого месяца — для сравнения; нет — без сравнения. */
    previous?: TranscriptionSpendTotalsDto;
}

/** Итог месяца плитками: деньги за Яндекс, его минуты, всего и бесплатно. */
export const SpendTotalsTiles = ({ month, totals, previous }: SpendTotalsTilesProps) => {
    const change = previous ? changeLabel(totals.rub, previous.rub) : null;
    const free = totals.calls - totals.yandexCalls;
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SpendTile
                label="Яндекс, рублей"
                value={rubLabel(totals.rub)}
                hint={
                    previous
                        ? `${change ?? 'в прошлом месяце не было'}${change ? ` ${previousMonthDative(month)}` : ''} · было ${rubLabel(previous.rub)}`
                        : 'Платим только за Яндекс'
                }
                tone={totals.rub > 0 ? 'warning' : 'muted'}
            />
            <SpendTile
                label="Минут в Яндексе"
                value={minutesLabel(totals.yandexMinutes)}
                hint={`${totals.yandexCalls.toLocaleString('ru-RU')} звонков`}
            />
            <SpendTile
                label="Всего распознано"
                value={`${totals.calls.toLocaleString('ru-RU')} звонков`}
                hint={minutesLabel(totals.minutes)}
            />
            <SpendTile
                label="Бесплатно"
                value={`${free.toLocaleString('ru-RU')} звонков`}
                hint="VibeCode и свой Whisper"
                tone={free > 0 ? 'success' : 'muted'}
            />
        </div>
    );
};
