'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
    TYPED_GROUPS,
    type TypedGroup,
} from '../../../../../lib/model/common';
import type { SmartGallerySource } from '../../../model';

/** Значение «все» для селектов (Radix Select не принимает пустую строку). */
export const GALLERY_FILTER_ALL = 'all';

/** Статус установки для фильтра галереи. */
export type GalleryStatusFilter = 'all' | 'installed' | 'not-installed';

const SOURCE_OPTIONS: { value: SmartGallerySource; label: string }[] = [
    { value: 'const', label: 'Const-эталон' },
    { value: 'excel', label: 'Excel-эталон' },
    { value: 'manual', label: 'Ручной' },
];

const STATUS_OPTIONS: { value: GalleryStatusFilter; label: string }[] = [
    { value: 'installed', label: 'Установлен' },
    { value: 'not-installed', label: 'Не установлен' },
];

/** Селект фильтра с подписью — локальный кирпичик панели фильтров. */
function FilterSelect({
    label,
    value,
    options,
    allLabel,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    allLabel: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={GALLERY_FILTER_ALL}>
                        {allLabel}
                    </SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

/**
 * Клиентские фильтры галереи смартов: источник/группа/тип/статус + поиск.
 * Отдельно — селект «Группа шаблонных»: в какую группу устанавливать (и в
 * какой показывать) неустановленные эталонные Excel-смарты.
 */
export function GalleryFilterBar({
    source,
    group,
    type,
    status,
    search,
    templateGroup,
    groupOptions,
    typeOptions,
    onSourceChange,
    onGroupChange,
    onTypeChange,
    onStatusChange,
    onSearchChange,
    onTemplateGroupChange,
}: {
    source: string;
    group: string;
    type: string;
    status: string;
    search: string;
    templateGroup: TypedGroup;
    groupOptions: string[];
    typeOptions: string[];
    onSourceChange: (value: string) => void;
    onGroupChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onTemplateGroupChange: (value: TypedGroup) => void;
}) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
            <FilterSelect
                label="Источник"
                value={source}
                options={SOURCE_OPTIONS}
                allLabel="Все источники"
                onChange={onSourceChange}
            />
            <FilterSelect
                label="Группа"
                value={group}
                options={groupOptions.map((o) => ({ value: o, label: o }))}
                allLabel="Все группы"
                onChange={onGroupChange}
            />
            <FilterSelect
                label="Тип"
                value={type}
                options={typeOptions.map((o) => ({ value: o, label: o }))}
                allLabel="Все типы"
                onChange={onTypeChange}
            />
            <FilterSelect
                label="Статус"
                value={status}
                options={STATUS_OPTIONS}
                allLabel="Все статусы"
                onChange={onStatusChange}
            />
            <div className="space-y-1">
                <Label>Поиск</Label>
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="name, title, entityTypeId…"
                    className="w-56"
                />
            </div>
            <div className="ml-auto space-y-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Label className="cursor-help underline decoration-dotted">
                            Группа шаблонных
                        </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Группа для установки/просмотра неустановленных
                        эталонных Excel-смартов.
                    </TooltipContent>
                </Tooltip>
                <Select
                    value={templateGroup}
                    onValueChange={(value) =>
                        onTemplateGroupChange(value as TypedGroup)
                    }
                >
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TYPED_GROUPS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
