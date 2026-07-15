'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventPostFailActions } from '@/modules/entities/EVPostFail';

/** Дата следующего звонка после «Отказа» (домены с withPostFail). */
export const PostFailSection: FC = () => {
    const dispatch = useAppDispatch();
    const postFailDate = useAppSelector(s => s.eventPostFail.postFailDate);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Следующий контакт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
                <Label>Когда перезвонить</Label>
                <Input
                    type="date"
                    value={postFailDate}
                    onChange={e => {
                        dispatch(
                            eventPostFailActions.setPostFailDate({
                                date: e.target.value,
                            }),
                        );
                        dispatch(eventPostFailActions.setIsChanged({ status: true }));
                    }}
                />
            </CardContent>
        </Card>
    );
};
