'use client';

import * as React from 'react';
import { ACard } from '@workspace/ui/shared';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Loader2 } from 'lucide-react';

interface InfoblockFlagsSectionProps {
    flags: {
        isProduct: boolean;
        isFree: boolean;
        isLa: boolean;
        isPackage: boolean;
        isSet: boolean;
    };
    onToggleFlag: (flagName: keyof InfoblockFlagsSectionProps['flags']) => void;
    onSave: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function InfoblockFlagsSection({
    flags,
    onToggleFlag,
    onSave,
    isLoading,
    disabled = false,
}: InfoblockFlagsSectionProps) {
    const flagConfigs = [
        { key: 'isProduct' as const, label: 'Является продуктом (isProduct)' },
        { key: 'isFree' as const, label: 'Бесплатный (isFree)' },
        { key: 'isLa' as const, label: 'Является LA (isLa)' },
        { key: 'isPackage' as const, label: 'Является пакетом (isPackage)' },
        { key: 'isSet' as const, label: 'Является набором (isSet)' },
    ];

    return (
        <ACard
            title="Флаги инфоблока"
            description="Управление флагами инфоблока"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {flagConfigs.map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={flags[key]}
                                onCheckedChange={() => onToggleFlag(key)}
                                disabled={disabled || isLoading}
                            />
                            <label
                                htmlFor={key}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {label}
                            </label>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    onClick={onSave}
                    disabled={disabled || isLoading}
                    size="sm"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Сохранение...
                        </>
                    ) : (
                        'Сохранить флаги'
                    )}
                </Button>
            </div>
        </ACard>
    );
}
