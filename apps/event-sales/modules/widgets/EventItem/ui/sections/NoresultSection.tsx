'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    eventReportActions,
} from '@/modules/entities/EventReport';

/** Причина «нерезультативного» события. */
export const NoresultSection: FC = () => {
    const dispatch = useAppDispatch();
    const noresultReason = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.NORESULT_REASON],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Причина</CardTitle>
            </CardHeader>
            <CardContent>
                <Select
                    value={String(noresultReason.current.id)}
                    onValueChange={value =>
                        dispatch(
                            eventReportActions.setReportProp({
                                propName: EV_REPORT_PROP.NORESULT_REASON,
                                value,
                            }),
                        )
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {noresultReason.items.map(item => (
                            <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
};
