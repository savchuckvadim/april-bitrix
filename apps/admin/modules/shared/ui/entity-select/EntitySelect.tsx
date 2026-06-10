'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/index';
import { Checkbox } from '@workspace/ui/index';
import { Field } from '@workspace/ui/shared';
import { Loader2 } from 'lucide-react';
import { useInfoblocks } from '@/modules/entities/garant/infoblock';
import { useInfoGroups } from '@/modules/entities/garant/info-groups';


export type EntityType = 'infoblock' | 'infogroup';

// Generic тип для фильтров (может работать с любыми типами сущностей)
type EntityFilterFn<TEntity = any> = (entity: TEntity) => boolean;

interface EntitySelectProps {
    entityType: EntityType;
    value: string | string[] | undefined;
    onChange: (value: string | string[]) => void;
    isMultiple?: boolean;
    label?: string;
    helperText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    showCode?: boolean; // Показывать ли код в опциях
    filterFn?: EntityFilterFn<any>; // Функция фильтрации (generic, работает с любыми типами)
}

export function EntitySelect({
    entityType,
    value,
    onChange,
    isMultiple = false,
    label,
    helperText,
    placeholder,
    disabled = false,
    required = false,
    className,
    showCode = true,
    filterFn,
}: EntitySelectProps) {
    const { data: infoblocks = [], isLoading: isLoadingInfoblocks } = useInfoblocks();
    const { data: infoGroups = [], isLoading: isLoadingGroups } = useInfoGroups();

    const isLoading = entityType === 'infoblock' ? isLoadingInfoblocks : isLoadingGroups;

    // Применяем фильтр если он передан
    const entities = React.useMemo(() => {
        const rawEntities = entityType === 'infoblock' ? infoblocks : infoGroups;
        if (filterFn) {
            return rawEntities.filter(filterFn as any);
        }
        return rawEntities;
    }, [entityType, infoblocks, infoGroups, filterFn]);

    // Нормализуем value для работы с массивом
    const selectedValues = React.useMemo(() => {
        if (isMultiple) {
            return Array.isArray(value) ? value : value ? [value] : [];
        }
        return value ? (Array.isArray(value) ? value[0] : value) : '';
    }, [value, isMultiple]);

    const handleSingleChange = (newValue: string) => {
        onChange(newValue);
    };

    const handleMultipleChange = (entityId: string, checked: boolean) => {
        const currentValues = Array.isArray(value) ? value : value ? [value] : [];
        if (checked) {
            onChange([...currentValues, entityId]);
        } else {
            onChange(currentValues.filter(id => id !== entityId));
        }
    };

    const getEntityDisplayName = (entity: { id: string; name: string; code?: string | null }) => {
        if (showCode && entity.code) {
            return `${entity.name} (${entity.code})`;
        }
        return entity.name;
    };

    if (isLoading) {
        return (
            <Field label={label} helperText={helperText} required={required}>
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            </Field>
        );
    }

    // Single select mode
    if (!isMultiple) {
        return (
            <Field label={label} helperText={helperText} required={required}>
                <Select
                    value={selectedValues as string}
                    onValueChange={handleSingleChange}
                    disabled={disabled}
                >
                    <SelectTrigger className={className}>
                        <SelectValue placeholder={placeholder || `Выберите ${entityType === 'infoblock' ? 'инфоблок' : 'группу'}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {entities.map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                                {getEntityDisplayName(entity)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        );
    }

    // Multiple select mode (checkboxes)
    const multipleSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];

    return (
        <Field label={label} helperText={helperText} required={required}>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {entities.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                        Нет доступных {entityType === 'infoblock' ? 'инфоблоков' : 'групп'}
                    </div>
                ) : (
                    entities.map((entity) => {
                        const isChecked = multipleSelectedValues.includes(entity.id);
                        return (
                            <div
                                key={entity.id}
                                className="flex items-center space-x-2 py-1 hover:bg-accent rounded px-2"
                            >
                                <Checkbox
                                    id={`entity-${entity.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                        handleMultipleChange(entity.id, checked as boolean)
                                    }
                                    disabled={disabled}
                                />
                                <label
                                    htmlFor={`entity-${entity.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                >
                                    {getEntityDisplayName(entity)}
                                </label>
                            </div>
                        );
                    })
                )}
            </div>
            {multipleSelectedValues.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                    Выбрано: {multipleSelectedValues.length}
                </div>
            )}
        </Field>
    );
}
