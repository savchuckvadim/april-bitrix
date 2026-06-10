'use client';

import * as React from 'react';
import { GetRegionResponseDto } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface RegionCardProps {
    item: GetRegionResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function RegionCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: RegionCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {/* TODO: Замените на поле с именем/названием */}
                            {item.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                           <p>ID: {item.id}</p>
                           <p>Code: {item.code}</p>
                           <p>Инфоблок: {item.infoblock}</p>
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
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-medium">{item.code}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Abs:</span>
                        <span className="font-medium">{item.abs}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="font-medium">{item.tax}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Abs:</span>
                        <span className="font-medium">{item.tax_abs}</span>
                    </div>
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
