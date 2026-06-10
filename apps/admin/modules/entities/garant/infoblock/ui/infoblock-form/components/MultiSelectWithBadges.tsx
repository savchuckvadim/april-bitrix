'use client';

import * as React from 'react';
import { Field } from '@workspace/ui/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { X } from 'lucide-react';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock/model';
import { INFOBLOCK_PATH } from '../../../consts/infoblock.consts';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
const path = INFOBLOCK_PATH;
interface MultiSelectWithBadgesProps {
    label: string;
    helperText?: string;
    placeholder: string;
    selectedIds: Set<string>;
    availableItems: InfoblockListItem[];
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
    getItemDisplayName: (item: InfoblockListItem) => string;
    emptyMessage?: string;
    disabled?: boolean;
}

export function MultiSelectWithBadges({
    label,
    helperText,
    placeholder,
    selectedIds,
    availableItems,
    onAdd,
    onRemove,
    getItemDisplayName,
    emptyMessage = 'Элементы не выбраны',
    disabled = false,
}: MultiSelectWithBadgesProps) {
    const availableForSelection = availableItems.filter(item => !selectedIds.has(item.id));

    return (
        <div className="space-y-4">
            <Field label={label} helperText={helperText}>
                <Select
                    value=""
                    onValueChange={(value) => {
                        if (value) {
                            onAdd(value);
                        }
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableForSelection.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {getItemDisplayName(item)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            {selectedIds.size > 0 ? (
                <div className="space-y-2">
                    <div className="text-sm font-medium">Выбранные элементы:</div>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(selectedIds).map((id) => {
                            const item = availableItems.find(i => i.id === id);
                            if (!item) return null;
                            return (

                                <Badge key={id} variant="secondary" className={cn(
                                    "flex items-center gap-1 border  rounded-md border-secondary  hover:bg-foreground/20",
                                    "hover:shadow-md transition-all duration-300 hover:text-primary hover:border-primary",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}>
                                    <Link href={`${path}/${id}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <p className="text-sm">{getItemDisplayName(item)}</p>
                                    </Link>
                                    <button
                                        style={{ cursor: 'pointer' }}
                                        type="button"
                                        onClick={() => onRemove(id)}
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
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}
