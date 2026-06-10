'use client';

import * as React from 'react';

import {
    ACard,
    Button,
} from '@workspace/ui/index';

import { InfoblockDetail } from '@/modules/entities/garant/infoblock/model';

interface InfoblockCardProps {
    item: InfoblockDetail;
    onViewDetails?: () => void;
}

export function InfoblockCard({
    item,
    onViewDetails,
}: InfoblockCardProps) {
    return (
        <ACard
            title={item.name}
            description={item.code}
            footer={
                onViewDetails && <Button variant="outline" onClick={onViewDetails} className="flex-1">
                    Подробнее
                </Button>
            }
        >
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
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-medium">{item.code}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Группа:</span>
                    <span className="font-medium">{item.group?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Parent:</span>
                    <span className="font-medium">{item.parent?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Relation:</span>
                    <span className="font-medium">{item.relation?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Описание:</span>
                    <span className="font-medium">{item.descriptionForSale}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Описание:</span>
                    <span className="font-medium">{item.description}</span>
                </div>
                {/* TODO: Добавьте поля из InfoblockDetail */}
            </div>
        </ACard>

    );
}
