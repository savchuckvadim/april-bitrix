'use client';

import * as React from 'react';
import { INFOBLOCK_PATH, InfoblockListItem } from '@/modules/entities/garant/infoblock';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { PackageColor } from '../../../lib/utils/package-colors.utils';
import Link from 'next/link';

interface InfoblockItemProps {
    infoblock: InfoblockListItem;
    isSelected: boolean;
    isInSelectedPackage: boolean;
    displayWeight: number;
    isPackage: boolean;
    childInfoblocksCount: number;
    packageColor: PackageColor | null;
    activePackages: Array<{ id: string; name: string; color: PackageColor }>;
    onToggle: (infoblockId: string, checked: boolean) => void;
}

export function InfoblockItem({
    infoblock,
    isSelected,
    isInSelectedPackage,
    displayWeight,
    isPackage,
    childInfoblocksCount,
    packageColor,
    activePackages,
    onToggle,
}: InfoblockItemProps) {
    return (
        <div
            className={`flex items-start gap-2 p-3 rounded-md border-2 ${isSelected
                ? packageColor
                    ? `${packageColor.borderColor} ${packageColor.textColor} bg-background`
                    : 'border-primary bg-primary/5'
                : packageColor
                    ? `${packageColor.borderColor} border-opacity-50`
                    : 'border-border'
                }`}
        >
            <Checkbox
                id={`infoblock-${infoblock.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => onToggle(infoblock.id, checked as boolean)}
                disabled={isInSelectedPackage && !isSelected}
            />
            <Label
                htmlFor={`infoblock-${infoblock.id}`}
                className="flex-1 cursor-pointer"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`${INFOBLOCK_PATH}/${infoblock.id}`}
                            key={infoblock.id} target="_blank"
                            className="w-full hover:text-primary"
                        >
                            <span className="font-medium">
                                {infoblock.name}
                            </span>
                        </Link>
                        {isPackage && (
                            <Badge
                                variant="outline"
                                className={
                                    packageColor
                                        ? `${packageColor.borderColor} ${packageColor.textColor} bg-transparent text-xs`
                                        : 'border-primary text-primary bg-transparent text-xs'
                                }
                            >
                                Пакет
                            </Badge>
                        )}
                        {/* Badge для ЭР, показывающие активные пакеты */}
                        {activePackages.map((pkg) => {
                            // Заменяем "Пакет Энциклопедий решений" на "ПЭР" для более короткого отображения
                            const displayName = pkg.name.replace(/Пакет Энциклопедий решений/gi, 'ПЭР');
                            const truncatedName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName;

                            return (
                                <Badge
                                    key={pkg.id}
                                    variant="outline"
                                    className={`${pkg.color.borderColor} ${pkg.color.textColor} bg-transparent`}
                                    title={pkg.name}
                                >
                                    {truncatedName}
                                </Badge>
                            );
                        })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <span>Вес: {displayWeight}</span>
                        {infoblock.code && (
                            <span className="ml-2">({infoblock.code})</span>
                        )}
                    </div>
                    {isPackage && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Включает: {childInfoblocksCount} инфоблоков
                        </div>
                    )}
                </div>
            </Label>
        </div>
    );
}
