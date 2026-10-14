'use client';

import { useMemo, useState } from 'react';
import {
    bucketCallsByHour,
    bucketPlannedByHour,
    bucketRecordsByHour,
    visibleHourRange,
} from '@/modules/entities/digest';
import { useDigestData } from '../../lib/digest-data.context';
import {
    bucketsInRange,
    callsSeries,
    eventSeries,
    plannedSeries,
    type TimelineView,
} from '../lib/timeline-series';

/** Почасовые корзины трёх графиков по видимым сотрудникам. */
export const useDigestTimeline = () => {
    const { visibleRows, focusRow } = useDigestData();
    const [view, setView] = useState<TimelineView>('chart');

    const data = useMemo(() => {
        const employees = visibleRows.map(row => row.employee);
        const records = employees.flatMap(employee => employee.records);
        const planned = employees.flatMap(employee => employee.plannedAtStartRecords);
        const events = bucketRecordsByHour(records);
        const plan = bucketPlannedByHour(planned);
        const calls = bucketCallsByHour(employees.map(employee => employee.calls));
        const range = visibleHourRange([events, plan, calls]);
        return {
            events: bucketsInRange(events, range),
            plan: bucketsInRange(plan, range),
            calls: bucketsInRange(calls, range),
            hasCalls: employees.some(employee => employee.calls !== null),
            eventsCount: records.length,
            plannedCount: planned.length,
        };
    }, [visibleRows]);

    const series = useMemo(
        () => ({
            events: eventSeries(),
            plan: plannedSeries(),
            calls: callsSeries(),
        }),
        [],
    );

    return {
        view,
        setView: (value: string) => setView(value as TimelineView),
        scopeLabel: focusRow ? focusRow.name : 'вся выборка',
        ...data,
        series,
    };
};
