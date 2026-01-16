'use client';

import * as React from 'react';
import { TimezoneResponseDto } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface TimezoneCardProps {
    item: TimezoneResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function TimezoneCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: TimezoneCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {/* TODO: Замените на поле с именем/названием */}
                            ID: {item.id}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {/* TODO: Добавьте описание */}
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
                    {/* TODO: Добавьте поля из TimezoneResponseDto */}
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
