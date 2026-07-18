'use client';

import * as React from 'react';
import { ACard, Field } from '@workspace/ui/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';
import { InfogroupResponseDto } from '@workspace/nest-admin-api';

interface InfoblockGroupSectionProps {
    selectedGroupId: string;
    onGroupChange: (groupId: string) => void;
    onSave: () => void;
    infoGroups: InfogroupResponseDto[];
    currentGroup?: { name: string; code: string };
    isLoading: boolean;
    disabled?: boolean;
    noneValue: string;
}

export function InfoblockGroupSection({
    selectedGroupId,
    onGroupChange,
    onSave,
    infoGroups,
    currentGroup,
    isLoading,
    disabled = false,
    noneValue,
}: InfoblockGroupSectionProps) {
    const canSave = selectedGroupId !== noneValue && !isLoading;

    return (
        <ACard
            title="Группа инфоблоков"
            description="Выберите группу, к которой принадлежит инфоблок (обязательно)"
        >
            <div className="space-y-4">
                <Field
                    label="Группа"
                    helperText="Группа должна быть выбрана"
                >
                    <div className="flex gap-2">
                        <Select
                            value={selectedGroupId}
                            onValueChange={onGroupChange}
                            disabled={disabled || isLoading}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Выберите группу" />
                            </SelectTrigger>
                            <SelectContent>
                                {infoGroups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name} ({group.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            onClick={onSave}
                            disabled={disabled || !canSave}
                            size="sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Сохранить'
                            )}
                        </Button>
                    </div>
                </Field>
                {currentGroup && (
                    <div className="text-sm text-muted-foreground">
                        Текущая группа: <strong>{currentGroup.name}</strong> ({currentGroup.code})
                    </div>
                )}
            </div>
        </ACard>
    );
}
