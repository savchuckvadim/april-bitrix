'use client';

import * as React from 'react';
import { GetSupplyResponseDto } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface SuppliesCardProps {
    item: GetSupplyResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function SuppliesCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: SuppliesCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {item.name || `ID: ${item.id}`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {item.fullName || item.shortName}
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
                        <span className="text-muted-foreground">Код:</span>
                        <span className="font-medium">{item.code}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Тип:</span>
                        <span className="font-medium">{item.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Количество пользователей:</span>
                        <span className="font-medium">{item.usersQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Коэффициент:</span>
                        <span className="font-medium">{item.coefficient}</span>
                    </div>
                    {/* TODO: Добавьте остальные поля из GetSupplyResponseDto */}
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
