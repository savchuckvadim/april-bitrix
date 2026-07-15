'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventSaleActions } from '@/modules/entities/EventSale';

/**
 * Продажа: связь с презентационной сделкой (при статусе «Продажа»).
 */
export const SaleSection: FC = () => {
    const dispatch = useAppDispatch();
    const presDeals = useAppSelector(s => s.eventSale.presDeals);

    return (
        <Card data-event-type="money_await">
            <CardHeader>
                <CardTitle className="text-base text-event-current">Продажа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
                {presDeals.items.length ? (
                    <>
                        <Label>Сделка презентации</Label>
                        <Select
                            value={
                                presDeals.current ? String(presDeals.current.ID) : undefined
                            }
                            onValueChange={value =>
                                dispatch(
                                    eventSaleActions.setCurrentPresItem({
                                        dealId: Number(value),
                                        type: 'current',
                                    }),
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Связать со сделкой" />
                            </SelectTrigger>
                            <SelectContent>
                                {presDeals.items.map(deal => (
                                    <SelectItem key={deal.ID} value={String(deal.ID)}>
                                        {deal.TITLE}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Связанных презентационных сделок нет
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
