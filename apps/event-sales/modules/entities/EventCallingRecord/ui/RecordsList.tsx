'use client';

import { FC, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getAudioRecords } from '../model/EventCallingRecordThunk';
import { RecordItem } from './RecordItem';

/**
 * Записи звонков компании (гейт withRecords в EventItem).
 * Загружаются лениво при первом показе секции.
 */
export const RecordsList: FC = () => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(s => s.eventCallingRecord.items);
    const isFetched = useAppSelector(s => s.eventCallingRecord.isFetched);
    const isLoading = useAppSelector(s => s.eventCallingRecord.isLoading);

    useEffect(() => {
        if (!isFetched && !isLoading) {
            dispatch(getAudioRecords());
        }
    }, [isFetched, isLoading]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Записи звонков</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading && (
                    <div className="h-12 animate-pulse rounded-md bg-muted" />
                )}
                {!isLoading && isFetched && !items.length && (
                    <p className="text-sm text-muted-foreground">Записей нет</p>
                )}
                {items.map(record => (
                    <RecordItem key={`${record.activityId}-${record.id}`} record={record} />
                ))}
            </CardContent>
        </Card>
    );
};

export default RecordsList;
