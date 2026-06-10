'use client';

import * as React from 'react';
import { ACard } from '@workspace/ui/shared';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { Search, X } from 'lucide-react';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock/model';
import { InfoblockSelectModal } from './InfoblockSelectModal';

interface InfoblockPackagesSectionProps {
    selectedPackageIds: Set<string>;
    packageInfoblocks: InfoblockListItem[];
    onAddPackage: (packageId: string) => void;
    onRemovePackage: (packageId: string) => void;
    disabled?: boolean;
}

export function InfoblockPackagesSection({
    selectedPackageIds,
    packageInfoblocks,
    onAddPackage,
    onRemovePackage,
    disabled = false,
}: InfoblockPackagesSectionProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const getPackageDisplayName = (pkg: InfoblockListItem) => {
        return `${pkg.name} (${pkg.code})`;
    };

    const handleModalSelect = (packageIds: string[]) => {
        packageIds.forEach(id => onAddPackage(id));
    };

    return (
        <>
            <ACard
                title="Пакеты (packages)"
                description="Пакеты, в которые входит текущий инфоблок"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Добавить пакет</div>
                        <div className="flex gap-2">
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value) {
                                        onAddPackage(value);
                                    }
                                }}
                                disabled={disabled}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Выберите пакет для добавления" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packageInfoblocks
                                        .filter(pkg => !selectedPackageIds.has(pkg.id))
                                        .map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {getPackageDisplayName(pkg)}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                disabled={disabled}
                                className="flex items-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Выбрать из списка
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Выберите пакет, в который входит текущий инфоблок
                        </p>
                    </div>

                    {selectedPackageIds.size > 0 ? (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Выбранные пакеты:</div>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(selectedPackageIds).map((packageId) => {
                                    const pkg = packageInfoblocks.find(p => p.id === packageId);
                                    if (!pkg) return null;
                                    return (
                                        <Badge key={packageId} variant="secondary" className="flex items-center gap-1">
                                            {getPackageDisplayName(pkg)}
                                            <button
                                                type="button"
                                                onClick={() => onRemovePackage(packageId)}
                                                disabled={disabled}
                                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Пакеты не выбраны
                        </div>
                    )}
                </div>
            </ACard>

            <InfoblockSelectModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                availableInfoblocks={packageInfoblocks}
                selectedInfoblockIds={selectedPackageIds}
                onSelect={handleModalSelect}
                title="Выбор пакетов"
                description="Выберите пакеты, в которые входит текущий инфоблок. Используйте поиск и фильтры для удобного поиска."
            />
        </>
    );
}
