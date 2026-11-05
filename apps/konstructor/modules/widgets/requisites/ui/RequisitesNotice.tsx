'use client';

import { Card, CardContent } from '@workspace/ui/components/card';

export interface RequisitesNoticeProps {
    text: string;
}

/** Состояние без данных: нет компании, реквизиты не загружены. */
export const RequisitesNotice = ({ text }: RequisitesNoticeProps) => (
    <Card>
        <CardContent className="p-6">
            <p className="text-muted-foreground">{text}</p>
        </CardContent>
    </Card>
);
