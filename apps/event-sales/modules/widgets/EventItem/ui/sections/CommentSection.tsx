'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP, setAndSaveComment } from '@/modules/entities/EventReport';

/** Комментарий отчёта (обязателен при отправке; черновик — в localStorage). */
export const CommentSection: FC = () => {
    const dispatch = useAppDispatch();
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    const error = useAppSelector(s => s.event.errors.current.comment);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Комментарий</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
                <Textarea
                    value={comment}
                    rows={4}
                    placeholder="Как прошёл разговор?"
                    aria-invalid={!!error}
                    onChange={e => dispatch(setAndSaveComment(e.target.value))}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
        </Card>
    );
};
