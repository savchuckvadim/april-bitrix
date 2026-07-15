'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_COMPANY_PROP,
    getByColor,
    setCurrentColor,
    updateCompany,
} from '@/modules/entities/EventCompany';
import { CompanyColorType } from '@/modules/entities/EventCompany/utils/event-company-util';

const COLOR_CLASS: Record<CompanyColorType, string> = {
    green: 'bg-success text-success-foreground',
    yellow: 'bg-warning text-warning-foreground',
    red: 'bg-destructive text-white',
};

/** Компания: прогноз (цвет, цикл red→yellow→green) и статус клиента. */
export const CompanySection: FC = () => {
    const dispatch = useAppDispatch();
    const color = useAppSelector(s => s.company.color);
    const status = useAppSelector(s => s.company.status);

    if (!color.field && !status.field) return null;

    const currentColor = (color.current?.code ?? 'red') as CompanyColorType;
    const { nextColor } = getByColor(currentColor);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Компания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {color.field && (
                    <div className="space-y-1.5">
                        <Label>Прогноз</Label>
                        <Button
                            type="button"
                            size="sm"
                            disabled={color.isLoading}
                            className={cn('w-full', COLOR_CLASS[currentColor])}
                            onClick={() => dispatch(setCurrentColor(nextColor))}
                        >
                            {color.current?.name ?? 'Обновить прогноз'}
                        </Button>
                        {color.error && (
                            <p className="text-sm text-destructive">{color.error}</p>
                        )}
                    </div>
                )}

                {status.field && status.items.length > 0 && (
                    <div className="space-y-1.5">
                        <Label>Статус клиента</Label>
                        <Select
                            value={
                                status.current && typeof status.current === 'object'
                                    ? status.current.code
                                    : undefined
                            }
                            onValueChange={code =>
                                dispatch(updateCompany(EV_COMPANY_PROP.STATUS, code))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                {status.items.map(item => (
                                    <SelectItem key={item.code} value={item.code}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
