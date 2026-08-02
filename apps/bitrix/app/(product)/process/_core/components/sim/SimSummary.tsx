'use client';

import type { FC } from 'react';
import { BarChart3 } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { findEventType } from '../../constants/sim-events';
import type { SimLogEntry } from '../../lib/simulator.util';

interface SimSummaryProps {
    log: SimLogEntry[];
}

interface Bar {
    eventCode: string;
    label: string;
    dataEventType: string;
    total: number;
    result: number;
    noresult: number;
}

/** Сводит записи KPI по типам событий, сохраняя порядок лестницы. */
const buildBars = (log: SimLogEntry[]): Bar[] => {
    const bars = new Map<string, Bar>();

    log.flatMap(entry => entry.kpi).forEach(record => {
        const event = findEventType(record.eventCode);
        const existing = bars.get(record.eventCode) ?? {
            eventCode: record.eventCode,
            label: event?.label ?? record.eventCode,
            dataEventType: event?.dataEventType ?? 'warm',
            total: 0,
            result: 0,
            noresult: 0,
        };

        bars.set(record.eventCode, {
            ...existing,
            total: existing.total + 1,
            result: existing.result + (record.isResult ? 1 : 0),
            noresult: existing.noresult + (record.isResult ? 0 : 1),
        });
    });

    return [...bars.values()].sort(
        (a, b) =>
            (findEventType(a.eventCode)?.order ?? 0) -
            (findEventType(b.eventCode)?.order ?? 0),
    );
};

/**
 * Разбор пройденного пути — то, ради чего отчётность вообще ведётся.
 *
 * Это не украшение в конце: именно так руководитель и видит работу менеджера —
 * не «продал / не продал», а сколько попыток стоила продажа и на каком шаге
 * теряется больше всего. Столбцы окрашены токенами типов событий, теми же, что
 * в форме, поэтому график читается без легенды.
 */
export const SimSummary: FC<SimSummaryProps> = ({ log }) => {
    const bars = buildBars(log);
    const max = Math.max(1, ...bars.map(bar => bar.total));
    const totalRecords = bars.reduce((sum, bar) => sum + bar.total, 0);
    const totalNoresult = bars.reduce((sum, bar) => sum + bar.noresult, 0);

    return (
        <GlassCard intensity="soft" className="rounded-2xl border p-4">
            <h3 className="text-foreground flex items-center gap-2 font-bold">
                <BarChart3 className="text-primary size-4" aria-hidden />
                Что попало в отчёты
            </h3>

            {bars.length === 0 ? (
                <p className="text-muted-foreground mt-3 rounded-xl border border-dashed p-4 text-xs leading-relaxed">
                    Ни одной записи KPI. Так бывает: если отчитываться только по
                    событиям без записи — документам и поставке, — работа
                    сделана, а в отчётах её нет.
                </p>
            ) : (
                <>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {totalRecords} записей за {log.length} шагов, из них
                        нерезультативных — {totalNoresult}.
                    </p>

                    <ul className="mt-3 space-y-2.5">
                        {bars.map(bar => (
                            <li
                                key={bar.eventCode}
                                data-event-type={bar.dataEventType}
                            >
                                <div className="flex items-baseline justify-between gap-2 text-xs">
                                    <span className="text-foreground font-semibold">
                                        {bar.label}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {bar.total}
                                        {bar.noresult > 0 &&
                                            ` · из них ${bar.noresult} без результата`}
                                    </span>
                                </div>

                                <div className="bg-muted mt-1 flex h-3 overflow-hidden rounded-full">
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${(bar.result / max) * 100}%`,
                                            backgroundColor:
                                                'var(--event-current)',
                                        }}
                                        title={`${bar.result} результативных`}
                                    />
                                    <div
                                        className="bg-muted-foreground/40 h-full"
                                        style={{
                                            width: `${(bar.noresult / max) * 100}%`,
                                        }}
                                        title={`${bar.noresult} нерезультативных`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="text-muted-foreground mt-3 text-[11px] leading-relaxed">
                        Насыщенным цветом — результативные события, серым —
                        нерезультативные. Второе не хуже первого: без него
                        нельзя отличить того, кто звонит и не может пробиться,
                        от того, кто не звонит.
                    </p>
                </>
            )}
        </GlassCard>
    );
};
