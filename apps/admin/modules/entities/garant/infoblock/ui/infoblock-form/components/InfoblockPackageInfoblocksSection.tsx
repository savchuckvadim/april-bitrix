'use client';

import * as React from 'react';
import { X, Search } from 'lucide-react';
import { ACard, Field } from '@workspace/ui/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/index';
import { Button } from '@workspace/ui/components/button';
import { InfoblockDetail, InfoblockListItem } from '@/modules/entities/garant/infoblock/model';
import Link from 'next/link';
import { INFOBLOCK_PATH } from '../../../consts/infoblock.consts';
import { InfoblockSelectModal } from './InfoblockSelectModal';

const path = INFOBLOCK_PATH;

interface InfoblockPackageInfoblocksSectionProps {
    selectedPackageInfoblockIds: Set<string>;
    availableChildInfoblocks: InfoblockListItem[];
    currentInfoblock: InfoblockDetail;
    onAddPackageInfoblock: (childInfoblockId: string) => void;
    onRemovePackageInfoblock: (childInfoblockId: string) => void;
    disabled?: boolean;
}

export function InfoblockPackageInfoblocksSection({
    selectedPackageInfoblockIds,
    availableChildInfoblocks,
    currentInfoblock,
    onAddPackageInfoblock,
    onRemovePackageInfoblock,
    disabled = false,
}: InfoblockPackageInfoblocksSectionProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const availableForSelection = availableChildInfoblocks.filter(
        ib => !selectedPackageInfoblockIds.has(ib.id)
    );

    const getChildDisplayName = (child: InfoblockListItem | InfoblockDetail) => {
        return `${child.name} (${child.code})`;
    };

    const handleModalSelect = (infoblockIds: string[]) => {
        infoblockIds.forEach(id => onAddPackageInfoblock(id));
    };

    return (
        <ACard
            title="Дочерние инфоблоки (packageInfoblocks)"
            description="Инфоблоки, входящие в этот пакет"
        >
            <div className="space-y-4">
                <Field
                    label="Добавить дочерний инфоблок"
                    helperText="Выберите инфоблок, который будет входить в этот пакет"
                >
                    <div className="flex gap-2">
                        <Select
                            value=""
                            onValueChange={(value) => {
                                if (value) {
                                    onAddPackageInfoblock(value);
                                }
                            }}
                            disabled={disabled}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Выберите инфоблок для добавления" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableForSelection.map((ib) => (
                                    <SelectItem key={ib.id} value={ib.id}>
                                        {getChildDisplayName(ib)}
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
                </Field>
                {selectedPackageInfoblockIds.size > 0 ? (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Текущие дочерние инфоблоки:</div>
                        <div className="space-y-2">
                            {Array.from(selectedPackageInfoblockIds).map((childId) => {
                                const child = availableChildInfoblocks.find(ib => ib.id === childId) ||
                                    currentInfoblock.packageInfoblocks?.find(ib => ib.id === childId);
                                if (!child) return null;
                                return (

                                    <div key={childId} className="flex items-center justify-between p-2 my-2 border rounded-md border-secondary  hover:bg-foreground/20
                                        hover:shadow-md transition-all duration-300 hover:text-primary hover:border-primary">
                                        <Link key={childId} href={`${path}/${childId}`}
                                            className="w-full"
                                        >
                                            <div>
                                                <div className="font-medium">{child.name}</div>
                                                <div className="text-sm text-muted-foreground">{child.code}</div>
                                            </div>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onRemovePackageInfoblock(childId)}
                                            disabled={disabled}
                                            className="ml-2 hover:bg-destructive/20 rounded-full p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        Дочерние инфоблоки отсутствуют
                    </div>
                )}
            </div>

            <InfoblockSelectModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                availableInfoblocks={availableChildInfoblocks}
                selectedInfoblockIds={selectedPackageInfoblockIds}
                onSelect={handleModalSelect}
                title="Выбор дочерних инфоблоков"
                description="Выберите инфоблоки, которые будут входить в этот пакет. Используйте поиск и фильтры для удобного поиска."
            />
        </ACard>
    );
}
