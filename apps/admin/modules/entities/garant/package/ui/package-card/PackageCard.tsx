'use client';

import * as React from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { IGarantPackage } from '../../model';

interface PackageCardProps {
    item: IGarantPackage;
    onViewDetails?: () => void;
}

export function PackageCard({
    item,
    onViewDetails,
}: PackageCardProps) {
    return (
        <Card className="w-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {item.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Code: {item.code}
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
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Name:</span>
                        <span className="font-medium">{item.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Short Name:</span>
                        <span className="font-medium">{item.shortName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-medium">{item.code}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{item.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span className="font-medium">{item.number}</span>
                    </div>
                    {item.weight && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{item.weight}</span>
                        </div>
                    )}
                    {item.color && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Color:</span>
                            <span className="font-medium">{item.color}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">With ABS:</span>
                        <span className="font-medium">{item.withABS ? 'Да' : 'Нет'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Is Changing:</span>
                        <span className="font-medium">{item.isChanging ? 'Да' : 'Нет'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">With Default:</span>
                        <span className="font-medium">{item.withDefault ? 'Да' : 'Нет'}</span>
                    </div>
                    {item.description && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Description:</span>
                            <span className="font-medium">{item.description}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button variant="outline" onClick={onViewDetails} className="flex-1">
                        Подробнее
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
