'use client';

import * as React from 'react';
import {
    GetPortalRegionResponseDto
} from '../../model'
import {
    Card,
    CardContent,
    CardDescription,

    CardHeader,
    CardTitle,
} from '@workspace/ui/index';
import Link from 'next/link';


interface PortalRegionsCardProps {
    item: GetPortalRegionResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function PortalRegionsCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: PortalRegionsCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {/* TODO: Замените на поле с именем/названием */}
                            <Link href={`/garant/regions/${item.id}`} target="_blank" rel="noopener noreferrer">
                                {item.title}

                            </Link>
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

        </Card>
    );
}
