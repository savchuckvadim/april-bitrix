'use client';

import { FC, useEffect } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getEventSalesHistory } from '@/modules/entities/EVHistory';

/**
 * История общения по компании (список «ОП История» на портале).
 *
 * Грузится при первом открытии вкладки, а не вместе с формой: большинство
 * отчётов пишут, не заглядывая в историю, и платить за неё запросом каждый
 * раз незачем.
 */
export const HistoryTab: FC = () => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(s => s.eventHistory.items);
    const isFetched = useAppSelector(s => s.eventHistory.isFetched);
    const isLoading = useAppSelector(s => s.eventHistory.isLoading);

    useEffect(() => {
        if (!isFetched && !isLoading) {
            dispatch(getEventSalesHistory());
        }
    }, [isFetched, isLoading]);

    return (
        <SectionCard title="История общения">
            {isLoading && (
                <div className="space-y-2">
                    <div className="h-10 animate-pulse rounded-md bg-muted" />
                    <div className="h-10 animate-pulse rounded-md bg-muted" />
                </div>
            )}

            {!isLoading && isFetched && !items?.length && (
                <p className="text-sm text-muted-foreground">
                    Записей нет
                </p>
            )}

            {!isLoading &&
                items?.map(item => (
                    <p
                        key={item.id}
                        className="rounded-md border border-border px-3 py-2 text-sm whitespace-pre-line"
                    >
                        {item.comment}
                    </p>
                ))}
        </SectionCard>
    );
};
