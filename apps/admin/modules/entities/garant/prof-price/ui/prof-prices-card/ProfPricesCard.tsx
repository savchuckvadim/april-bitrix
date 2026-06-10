'use client';

import * as React from 'react';
import { PriceEntity } from '../../model';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface ProfPricesCardProps {
    item: PriceEntity;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function ProfPricesCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: ProfPricesCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            ID: {item.id}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Тип региона: {item.region_type}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{item.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Тип региона:</span>
                        <span className="font-medium">{item.region_type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Значение:</span>
                        <span className="font-medium">{item.value}</span>
                    </div>
                    {item.discount !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Скидка:</span>
                            <span className="font-medium">{item.discount}</span>
                        </div>
                    )}
                    {item.complect_id !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID комплекта:</span>
                            <span className="font-medium">{item.complect_id}</span>
                        </div>
                    )}
                    {item.garant_package_id !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID пакета:</span>
                            <span className="font-medium">{item.garant_package_id}</span>
                        </div>
                    )}
                    {item.supply_id !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID поставки:</span>
                            <span className="font-medium">{item.supply_id}</span>
                        </div>
                    )}
                    {/* TODO: Добавьте остальные поля из PriceEntity */}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button variant="outline" onClick={onViewDetails} className="flex-1">
                        Подробнее
                    </Button>
                )}
                {onEdit && (
                    <Button variant="outline" onClick={onEdit} className="flex-1">
                        Изменить
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="flex-1"
                    >
                        Удалить
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
