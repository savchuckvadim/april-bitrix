'use client';

import { Button } from '@workspace/ui/components/button';
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

/** Значение «все» для селектов (Radix Select не принимает пустую строку). */
export const FILTER_ALL = 'all';

/**
 * Панель клиентских фильтров смартов: селекты группа/тип (значения — из уже
 * загруженных данных), текстовый поиск и кнопка установки AI-смарта. Никакие
 * параметры фильтра на сервер не уходят.
 */
export function SmartsFilterBar({
    group,
    type,
    search,
    groupOptions,
    typeOptions,
    onGroupChange,
    onTypeChange,
    onSearchChange,
    onInstallAicall,
}: {
    group: string;
    type: string;
    search: string;
    groupOptions: string[];
    typeOptions: string[];
    onGroupChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onInstallAicall: () => void;
}) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
            <div className="space-y-1">
                <Label>Группа</Label>
                <Select value={group} onValueChange={onGroupChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={FILTER_ALL}>Все группы</SelectItem>
                        {groupOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label>Тип</Label>
                <Select value={type} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={FILTER_ALL}>Все типы</SelectItem>
                        {typeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label>Поиск</Label>
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="name, title, entityTypeId…"
                    className="w-56"
                />
            </div>
            <div className="ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={onInstallAicall}>
                            Установить AI-анализ звонков
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Идемпотентная установка смарта «AI-анализ звонков» на
                        портал: создаёт тип при отсутствии и доливает
                        недостающие поля. Выполняется до 2 минут.
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
