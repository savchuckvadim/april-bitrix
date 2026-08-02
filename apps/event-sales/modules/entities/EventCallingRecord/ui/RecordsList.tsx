'use client';

import { FC, useEffect, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getAudioRecords } from '../model/EventCallingRecordThunk';
import { RecordItem } from './RecordItem';

/**
 * Записи звонков компании (гейт withRecords в EventItem).
 * Секция свёрнута по умолчанию, запрос уходит при первом раскрытии —
 * не тянем записи и не монтируем плееры, пока их не попросили.
 */
export const RecordsList: FC = () => {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const items = useAppSelector(s => s.eventCallingRecord.items);
    const isFetched = useAppSelector(s => s.eventCallingRecord.isFetched);
    const isLoading = useAppSelector(s => s.eventCallingRecord.isLoading);

    useEffect(() => {
        if (isOpen && !isFetched && !isLoading) {
            dispatch(getAudioRecords());
        }
    }, [isOpen, isFetched, isLoading]);

    return (
        <SectionCard
            title="Записи звонков"
            surface="solid"
            collapsible
            defaultOpen={false}
            onOpenChange={setIsOpen}
        >
            {isLoading && <div className="h-12 animate-pulse rounded-md bg-muted" />}
            {!isLoading && isFetched && !items.length && (
                <p className="text-sm text-muted-foreground">Записей нет</p>
            )}
            {items.map(record => (
                <RecordItem
                    key={`${record.activityId}-${record.id}`}
                    record={record}
                />
            ))}
        </SectionCard>
    );
};

export default RecordsList;
