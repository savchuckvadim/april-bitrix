'use client';

import { FC } from 'react';
import type { ZprCallsState } from '../lib/hooks/use-zpr-calls';
import { ZprCallRow } from './ZprCallRow';

interface ZprCallsListProps {
    calls: ZprCallsState;
}

/**
 * Лента ЗПР: открытые + последние закрытые. Общая для карточки клиента и
 * панели в форме отчёта — различается только обёртка-поверхность.
 */
export const ZprCallsList: FC<ZprCallsListProps> = ({ calls }) => {
    const hiddenClosed = calls.closedTotal - calls.closed.length;

    return (
        <div className="space-y-1.5">
            {calls.open.length > 0 && (
                <ul className="space-y-1.5">
                    {calls.open.map(view => (
                        <ZprCallRow
                            key={view.call.id}
                            view={view}
                            dict={calls.dictOf(view)}
                        />
                    ))}
                </ul>
            )}
            {calls.closed.length > 0 && (
                <>
                    <p className="text-[0.6875rem] uppercase tracking-wide text-muted-foreground/70">
                        Последние закрытые
                    </p>
                    <ul className="space-y-1.5">
                        {calls.closed.map(view => (
                            <ZprCallRow
                                key={view.call.id}
                                view={view}
                                dict={calls.dictOf(view)}
                            />
                        ))}
                    </ul>
                    {hiddenClosed > 0 && (
                        <p className="text-[0.6875rem] text-muted-foreground/70">
                            и ещё {hiddenClosed} в истории смарта
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
