'use client';

import * as React from 'react';
import { ACard } from '@workspace/ui/shared';
import { Button } from '@workspace/ui';
import { useComplectInfoblocksForm } from '../../lib/hooks/';
import { WeightAlert } from './components/WeightAlert';
import { InfoblockGroup } from './components/InfoblockGroup';

interface ComplectInfoblocksFormProps {
    complectId: string;
    onCancel?: () => void;
}

export function ComplectInfoblocksForm({
    complectId,
    onCancel,
}: ComplectInfoblocksFormProps) {

    const {
        complect,
        selectedInfoblockIds,
        allInfoblocks,
        infoGroups,
        packageColorMap,

        isLoadingComplect,
        isLoadingInfoblocks,
        isLoadingGroups,
        setInfoblocksMutation,
        handleInfoblockToggle,
        groupedInfoblocks,
        totalWeight,
        complectWeight,
        weightMatches,
        weightDifference,
        getActivePackages,
        handleSubmit
    } = useComplectInfoblocksForm(complectId);

    if (isLoadingInfoblocks || isLoadingComplect || isLoadingGroups) {
        return (
            <ACard title="Редактирование наполнения комплекта">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ACard>
        );
    }

    return (
        <form onSubmit={handleSubmit}>

            <ACard
                // title="Редактирование наполнения комплекта"
                description={`Комплект: ${complect?.name || complectId}`}
                footer={
                    <div className="w-full flex gap-2 justify-end">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={setInfoblocksMutation.isPending}
                            >
                                Отмена
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={setInfoblocksMutation.isPending || !weightMatches}
                        >
                            {setInfoblocksMutation.isPending
                                ? 'Сохранение...'
                                : 'Сохранить'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Информация о весе */}
                    <WeightAlert
                        totalWeight={totalWeight}
                        complectWeight={complectWeight}
                        weightMatches={weightMatches}
                        weightDifference={weightDifference}
                    />

                    {/* Группы инфоблоков */}
                    <div className="space-y-6">
                        {groupedInfoblocks.map((group) => (
                            <InfoblockGroup
                                key={group.groupId}
                                group={group}
                                allInfoblocks={allInfoblocks}
                                infoGroups={infoGroups}
                                selectedInfoblockIds={selectedInfoblockIds}
                                packageColorMap={packageColorMap}
                                onInfoblockToggle={handleInfoblockToggle}
                                getActivePackagesForInfoblock={getActivePackages}
                            />
                        ))}
                    </div>
                </div>
            </ACard>
        </form>
    );
}
